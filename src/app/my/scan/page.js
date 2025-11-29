'use client';

import { useState, useRef, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/contexts/AuthContext';
import { api } from '@/lib/api';
import Link from 'next/link';

export default function FoodScannerPage() {
    const { user, loading, logout } = useAuth();
    const router = useRouter();
    const [selectedImage, setSelectedImage] = useState(null);
    const [previewUrl, setPreviewUrl] = useState(null);
    const [analyzing, setAnalyzing] = useState(false);
    const [result, setResult] = useState(null);
    const [error, setError] = useState(null);
    const fileInputRef = useRef(null);
    const [useCamera, setUseCamera] = useState(false);
    const [facingMode, setFacingMode] = useState('environment');
    const videoRef = useRef(null);
    const canvasRef = useRef(null);
    const [stream, setStream] = useState(null);
    const [isMobile, setIsMobile] = useState(false);
    const [availableCameras, setAvailableCameras] = useState([]);
    const [selectedDeviceId, setSelectedDeviceId] = useState(null);
    const [showCameraSelect, setShowCameraSelect] = useState(false);
    const [showLogModal, setShowLogModal] = useState(false);
    const [logFormData, setLogFormData] = useState({
        meal_type: 'breakfast',
        food_name: '',
        calories: '',
        protein_g: '',
        carbs_g: '',
        fat_g: '',
        serving_size: '',
        notes: '',
    });

    useEffect(() => {
        if (!loading && !user) {
            router.push('/auth/login');
        }
    }, [user, loading, router]);

    useEffect(() => {
        const checkMobile = () => {
            setIsMobile(/Android|webOS|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(navigator.userAgent));
        };
        checkMobile();
        window.addEventListener('resize', checkMobile);
        return () => window.removeEventListener('resize', checkMobile);
    }, []);

    useEffect(() => {
        const getCameras = async () => {
            try {
                const devices = await navigator.mediaDevices.enumerateDevices();
                const videoDevices = devices.filter(device => device.kind === 'videoinput');
                setAvailableCameras(videoDevices);
                if (videoDevices.length > 0 && !selectedDeviceId) {
                    setSelectedDeviceId(videoDevices[0].deviceId);
                }
            } catch (err) {
                console.error('Failed to enumerate cameras:', err);
            }
        };
        getCameras();
    }, []);

    useEffect(() => {
        return () => {
            if (stream) {
                stream.getTracks().forEach(track => track.stop());
            }
        };
    }, [stream]);

    const handleFileSelect = (e) => {
        const file = e.target.files[0];
        if (file) {
            if (file.size > 10 * 1024 * 1024) {
                setError('Image size must be less than 10MB');
                return;
            }
            setSelectedImage(file);
            setPreviewUrl(URL.createObjectURL(file));
            setResult(null);
            setError(null);
        }
    };

    const startCamera = async (deviceId = null) => {
        try {
            if (stream) {
                stream.getTracks().forEach(track => track.stop());
            }

            let mediaStream;

            const attempts = [];

            if (deviceId) {
                attempts.push(
                    { video: { deviceId: { ideal: deviceId } } },
                    { video: { deviceId: deviceId } },
                    { video: true }
                );
            } else if (isMobile) {
                attempts.push(
                    { video: { facingMode: facingMode } },
                    { video: true }
                );
            } else {
                attempts.push({ video: true });
            }

            let lastError = null;

            for (let i = 0; i < attempts.length; i++) {
                try {
                    console.log(`Camera attempt ${i + 1}/${attempts.length}:`, attempts[i]);
                    mediaStream = await navigator.mediaDevices.getUserMedia(attempts[i]);
                    console.log('Camera started successfully!');
                    break;
                } catch (err) {
                    console.log(`Attempt ${i + 1} failed:`, err.name, err.message);
                    lastError = err;
                }
            }

            if (!mediaStream) {
                throw lastError || new Error('Failed to start camera');
            }

            setStream(mediaStream);
            if (videoRef.current) {
                videoRef.current.srcObject = mediaStream;
                videoRef.current.onloadedmetadata = () => {
                    videoRef.current.play().catch(err => {
                        console.error('Error playing video:', err);
                        setError('Failed to start video playback. Please try again.');
                    });
                };
            }
            setUseCamera(true);
            setError(null);
        } catch (err) {
            console.error('Final camera error:', err);
            let errorMessage = 'Failed to access camera. ';
            if (err.name === 'NotAllowedError' || err.name === 'PermissionDeniedError') {
                errorMessage += 'Please grant camera permissions in your browser settings.';
            } else if (err.name === 'NotFoundError' || err.name === 'DevicesNotFoundError') {
                errorMessage += 'No camera found on this device.';
            } else if (err.name === 'NotReadableError' || err.name === 'TrackStartError') {
                errorMessage += 'Camera is already in use. Close other apps using the camera.';
            } else if (err.name === 'OverconstrainedError') {
                errorMessage += 'Camera settings not supported. Try a different camera.';
            } else {
                errorMessage += `${err.message || 'Please check your camera and try again.'}`;
            }
            setError(errorMessage);
        }
    };

    const flipCamera = async () => {
        const newFacingMode = facingMode === 'user' ? 'environment' : 'user';
        setFacingMode(newFacingMode);

        try {
            if (stream) {
                stream.getTracks().forEach(track => track.stop());
            }

            let mediaStream;
            try {
                mediaStream = await navigator.mediaDevices.getUserMedia({
                    video: { facingMode: newFacingMode }
                });
            } catch (err) {
                if (err.name === 'OverconstrainedError') {
                    console.log('FacingMode not supported, using default camera...');
                    mediaStream = await navigator.mediaDevices.getUserMedia({
                        video: true
                    });
                } else {
                    throw err;
                }
            }

            setStream(mediaStream);
            if (videoRef.current) {
                videoRef.current.srcObject = mediaStream;
                videoRef.current.onloadedmetadata = () => {
                    videoRef.current.play();
                };
            }
        } catch (err) {
            setError('Failed to flip camera. Please try again.');
            console.error('Camera flip error:', err);
        }
    };

    const switchCamera = async (deviceId) => {
        setSelectedDeviceId(deviceId);
        setShowCameraSelect(false);
        await startCamera(deviceId);
    };

    const stopCamera = () => {
        if (stream) {
            stream.getTracks().forEach(track => track.stop());
            setStream(null);
        }
        setUseCamera(false);
    };

    const capturePhoto = () => {
        if (videoRef.current && canvasRef.current) {
            const video = videoRef.current;
            const canvas = canvasRef.current;
            canvas.width = video.videoWidth;
            canvas.height = video.videoHeight;
            const ctx = canvas.getContext('2d');
            ctx.drawImage(video, 0, 0);

            canvas.toBlob((blob) => {
                const file = new File([blob], 'camera-capture.jpg', { type: 'image/jpeg' });
                setSelectedImage(file);
                setPreviewUrl(URL.createObjectURL(file));
                setResult(null);
                setError(null);
                stopCamera();
            }, 'image/jpeg', 0.9);
        }
    };

    const analyzeFood = async () => {
        if (!selectedImage) {
            setError('Please select or capture an image first');
            return;
        }

        setAnalyzing(true);
        setError(null);
        setResult(null);

        try {
            const response = await api.analyzeFoodImage(selectedImage);
            setResult(response);
        } catch (err) {
            setError(err.message || 'Failed to analyze food. Please try again.');
            console.error('Analysis error:', err);
        } finally {
            setAnalyzing(false);
        }
    };

    const resetScanner = () => {
        setSelectedImage(null);
        setPreviewUrl(null);
        setResult(null);
        setError(null);
        stopCamera();
    };

    const openLogModal = () => {
        console.log('Opening log modal with result:', result);

        let foodName = '';
        let calories = '';
        let protein = '';
        let carbs = '';
        let fat = '';
        let servingSize = '';
        let notes = '';

        let parsedData = result;

        if (result) {
            if (result.analysis && typeof result.analysis === 'string') {
                try {
                    let cleanedAnalysis = result.analysis.trim();

                    cleanedAnalysis = cleanedAnalysis.replace(/^```json?\s*/i, '');
                    cleanedAnalysis = cleanedAnalysis.replace(/```\s*$/, '');
                    cleanedAnalysis = cleanedAnalysis.trim();

                    parsedData = JSON.parse(cleanedAnalysis);
                    console.log('Parsed analysis:', parsedData);
                } catch (e) {
                    console.log('Analysis is not JSON, trying to extract JSON from text:', e);

                    const jsonMatch = result.analysis.match(/\{[\s\S]*\}/);
                    if (jsonMatch) {
                        try {
                            parsedData = JSON.parse(jsonMatch[0]);
                            console.log('Extracted JSON from text:', parsedData);
                        } catch (e2) {
                            console.log('Failed to extract JSON, using raw result');
                            parsedData = result;
                        }
                    } else {
                        parsedData = result;
                    }
                }
            }

            if (parsedData.food_name) {
                foodName = parsedData.food_name;
            }

            if (parsedData.serving_size) {
                servingSize = parsedData.serving_size;
            }

            if (parsedData.calories) {
                const calStr = String(parsedData.calories);
                const calMatch = calStr.match(/(\d+)/);
                if (calMatch) {
                    calories = calMatch[1];
                }
            }

            if (parsedData.macronutrients) {
                const macros = parsedData.macronutrients;

                if (macros.protein) {
                    const proteinMatch = String(macros.protein).match(/(\d+)/);
                    if (proteinMatch) {
                        protein = proteinMatch[1];
                    }
                }

                if (macros.carbohydrates) {
                    const carbsMatch = String(macros.carbohydrates).match(/(\d+)/);
                    if (carbsMatch) {
                        carbs = carbsMatch[1];
                    }
                }

                if (macros.fat) {
                    const fatMatch = String(macros.fat).match(/(\d+)/);
                    if (fatMatch) {
                        fat = fatMatch[1];
                    }
                }
            }

            notes = '';
            if (parsedData.health_notes) {
                notes += `Health Notes: ${parsedData.health_notes}\n\n`;
            }
            if (parsedData.recommendations) {
                notes += `Recommendations: ${parsedData.recommendations}`;
            }

            if ((!foodName || !calories) && typeof result.analysis === 'string' && parsedData === result) {
                const analysis = result.analysis;

                if (!foodName) {
                    const foodMatch = analysis.match(/(?:Food|Item|Dish)[:\s]+([^\n]+)/i);
                    if (foodMatch) {
                        foodName = foodMatch[1].trim();
                    }
                }

                if (!calories) {
                    const calMatch = analysis.match(/(\d+(?:\.\d+)?)\s*(?:kcal|calories|cal)/i);
                    if (calMatch) {
                        calories = calMatch[1];
                    }
                }

                if (!protein) {
                    const proteinMatch = analysis.match(/(?:protein)[:\s]+(\d+(?:\.\d+)?)\s*g/i);
                    if (proteinMatch) {
                        protein = proteinMatch[1];
                    }
                }

                if (!carbs) {
                    const carbsMatch = analysis.match(/(?:carb|carbohydrate)[s]?[:\s]+(\d+(?:\.\d+)?)\s*g/i);
                    if (carbsMatch) {
                        carbs = carbsMatch[1];
                    }
                }

                if (!fat) {
                    const fatMatch = analysis.match(/(?:fat)[:\s]+(\d+(?:\.\d+)?)\s*g/i);
                    if (fatMatch) {
                        fat = fatMatch[1];
                    }
                }

                if (!servingSize) {
                    const servingMatch = analysis.match(/(?:serving|portion)[:\s]+([^\n]+)/i);
                    if (servingMatch) {
                        servingSize = servingMatch[1].trim();
                    }
                }
            }
        }

        console.log('Extracted values:', { foodName, calories, protein, carbs, fat, servingSize });

        setLogFormData({
            meal_type: 'breakfast',
            food_name: foodName,
            calories: calories,
            protein_g: protein,
            carbs_g: carbs,
            fat_g: fat,
            serving_size: servingSize,
            notes: notes || result?.analysis || '',
        });
        setShowLogModal(true);
    }; const handleLogMeal = async (e) => {
        e.preventDefault();

        try {
            const mealData = {
                meal_type: logFormData.meal_type,
                food_name: logFormData.food_name,
                calories: parseFloat(logFormData.calories) || 0,
                protein_g: parseFloat(logFormData.protein_g) || 0,
                carbs_g: parseFloat(logFormData.carbs_g) || 0,
                fat_g: parseFloat(logFormData.fat_g) || 0,
                serving_size: logFormData.serving_size,
                notes: logFormData.notes,
            };

            await api.logMeal(mealData);
            setShowLogModal(false);

            const successDiv = document.createElement('div');
            successDiv.className = 'fixed top-4 right-4 bg-green-500 text-white px-6 py-3 rounded-lg shadow-lg z-50';
            successDiv.textContent = '✓ Meal logged successfully!';
            document.body.appendChild(successDiv);
            setTimeout(() => successDiv.remove(), 3000);
        } catch (err) {
            console.error('Error logging meal:', err);
            setError(err.message || 'Failed to log meal');
        }
    };

    if (loading) {
        return (
            <div className="min-h-screen flex items-center justify-center bg-gray-50">
                <div className="text-center">
                    <div className="w-16 h-16 border-4 border-indigo-200 border-t-indigo-600 rounded-full animate-spin mx-auto mb-4" />
                    <p className="text-gray-600">Loading...</p>
                </div>
            </div>
        );
    }

    if (!user) {
        return null;
    }

    return (
        <div className="min-h-screen bg-gray-50">
            <header className="bg-white shadow-sm sticky top-0 z-50">
                <div className="max-w-7xl mx-auto px-3 sm:px-4 md:px-6 lg:px-8 py-3 sm:py-4 flex justify-between items-center">
                    <div className="flex items-center gap-2 sm:gap-4">
                        <Link href="/my" className="text-gray-600 hover:text-gray-900 p-1 -ml-1">
                            <svg className="w-5 h-5 sm:w-6 sm:h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
                            </svg>
                        </Link>
                        <div className="flex items-center gap-2 sm:gap-3">
                            <div className="w-8 h-8 sm:w-10 sm:h-10 bg-gradient-to-br from-indigo-500 to-purple-600 rounded-lg flex items-center justify-center">
                                <span className="text-white font-bold text-lg sm:text-xl">A</span>
                            </div>
                            <h1 className="text-lg sm:text-2xl font-bold text-gray-900">Food Scanner</h1>
                        </div>
                    </div>

                    <div className="relative group">
                        <button className="flex items-center gap-2 sm:gap-3 px-2 sm:px-3 py-2 rounded-lg hover:bg-gray-100 transition-colors">
                            {user.profile_image ? (
                                <img
                                    src={user.profile_image}
                                    alt={user.name}
                                    className="w-8 h-8 sm:w-10 sm:h-10 rounded-full border-2 border-indigo-100 object-cover"
                                    onError={(e) => {
                                        e.target.style.display = 'none';
                                        e.target.nextSibling.style.display = 'flex';
                                    }}
                                />
                            ) : null}
                            <div
                                className="w-8 h-8 sm:w-10 sm:h-10 rounded-full border-2 border-indigo-100 bg-gradient-to-br from-indigo-500 to-purple-600 flex items-center justify-center text-white font-bold text-sm sm:text-base"
                                style={{ display: user.profile_image ? 'none' : 'flex' }}
                            >
                                {user.name?.charAt(0).toUpperCase()}
                            </div>
                        </button>
                    </div>
                </div>
            </header>

            <main className="max-w-4xl mx-auto px-3 sm:px-4 md:px-6 lg:px-8 py-4 sm:py-8">
                <div className="bg-white rounded-2xl shadow-lg p-4 sm:p-6 md:p-8">
                    <h2 className="text-xl sm:text-2xl font-bold text-gray-900 mb-4 sm:mb-6">Analyze Your Food</h2>

                    {!previewUrl && !useCamera && (
                        <div className="space-y-4">
                            <div
                                onClick={() => fileInputRef.current?.click()}
                                className="border-2 border-dashed border-gray-300 rounded-xl p-8 sm:p-12 text-center hover:border-indigo-500 hover:bg-indigo-50 active:bg-indigo-100 transition-all cursor-pointer touch-manipulation"
                            >
                                <svg className="w-12 h-12 sm:w-16 sm:h-16 text-gray-400 mx-auto mb-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 16a4 4 0 01-.88-7.903A5 5 0 1115.9 6L16 6a5 5 0 011 9.9M15 13l-3-3m0 0l-3 3m3-3v12" />
                                </svg>
                                <p className="text-base sm:text-lg font-semibold text-gray-900 mb-2">Upload Food Image</p>
                                <p className="text-sm sm:text-base text-gray-600">{isMobile ? 'Tap to select image' : 'Click to browse or drag and drop'}</p>
                                <p className="text-xs text-gray-500 mt-2">Supports JPG, PNG (Max 10MB)</p>
                            </div>
                            <input
                                ref={fileInputRef}
                                type="file"
                                accept="image/*"
                                capture={isMobile ? "environment" : undefined}
                                onChange={handleFileSelect}
                                className="hidden"
                            />

                            <div className="text-center">
                                <p className="text-gray-600 mb-4 text-sm sm:text-base">Or</p>
                                <button
                                    onClick={startCamera}
                                    className="w-full sm:w-auto inline-flex items-center justify-center gap-2 px-6 py-3.5 bg-gradient-to-r from-indigo-600 to-purple-600 text-white rounded-lg font-semibold hover:from-indigo-700 hover:to-purple-700 transition-all shadow-md hover:shadow-lg text-base touch-manipulation"
                                >
                                    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 9a2 2 0 012-2h.93a2 2 0 001.664-.89l.812-1.22A2 2 0 0110.07 4h3.86a2 2 0 011.664.89l.812 1.22A2 2 0 0018.07 7H19a2 2 0 012 2v9a2 2 0 01-2 2H5a2 2 0 01-2-2V9z" />
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 13a3 3 0 11-6 0 3 3 0 016 0z" />
                                    </svg>
                                    {isMobile ? 'Open Camera' : 'Use Camera'}
                                </button>
                            </div>
                        </div>
                    )}

                    {useCamera && (
                        <div className="space-y-4">
                            <div className="relative bg-black rounded-xl overflow-hidden">
                                <video
                                    ref={videoRef}
                                    autoPlay
                                    playsInline
                                    muted
                                    className="w-full h-auto max-h-[70vh] object-contain"
                                />
                                <div className="absolute top-4 right-4 flex flex-col gap-2">
                                    {!isMobile && availableCameras.length > 1 && (
                                        <div className="relative">
                                            <button
                                                onClick={() => setShowCameraSelect(!showCameraSelect)}
                                                className="p-3 bg-white/90 backdrop-blur-sm rounded-full shadow-lg hover:bg-white transition-all"
                                                title="Select Camera"
                                            >
                                                <svg className="w-6 h-6 text-gray-700" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6V4m0 2a2 2 0 100 4m0-4a2 2 0 110 4m-6 8a2 2 0 100-4m0 4a2 2 0 110-4m0 4v2m0-6V4m6 6v10m6-2a2 2 0 100-4m0 4a2 2 0 110-4m0 4v2m0-6V4" />
                                                </svg>
                                            </button>
                                            {showCameraSelect && (
                                                <div className="absolute right-0 mt-2 w-64 bg-white rounded-lg shadow-xl border border-gray-200 p-2 z-10">
                                                    <p className="text-xs font-semibold text-gray-600 px-2 py-1 mb-1">Select Camera</p>
                                                    {availableCameras.map((camera, index) => (
                                                        <button
                                                            key={camera.deviceId}
                                                            onClick={() => switchCamera(camera.deviceId)}
                                                            className={`w-full text-left px-3 py-2 text-sm rounded hover:bg-indigo-50 transition-colors ${selectedDeviceId === camera.deviceId ? 'bg-indigo-100 text-indigo-700 font-medium' : 'text-gray-700'
                                                                }`}
                                                        >
                                                            {camera.label || `Camera ${index + 1}`}
                                                        </button>
                                                    ))}
                                                </div>
                                            )}
                                        </div>
                                    )}
                                    {isMobile && (
                                        <button
                                            onClick={flipCamera}
                                            className="p-3 bg-white/90 backdrop-blur-sm rounded-full shadow-lg hover:bg-white transition-all"
                                            title="Flip Camera"
                                        >
                                            <svg className="w-6 h-6 text-gray-700" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
                                            </svg>
                                        </button>
                                    )}
                                </div>
                            </div>
                            <div className="flex flex-col sm:flex-row gap-3 justify-center">
                                <button
                                    onClick={capturePhoto}
                                    className="flex-1 sm:flex-none px-8 py-4 bg-gradient-to-r from-indigo-600 to-purple-600 text-white rounded-lg font-semibold hover:from-indigo-700 hover:to-purple-700 transition-all shadow-md hover:shadow-lg text-base sm:text-lg"
                                >
                                    📸 Capture Photo
                                </button>
                                <button
                                    onClick={stopCamera}
                                    className="flex-1 sm:flex-none px-8 py-4 bg-gray-600 text-white rounded-lg font-semibold hover:bg-gray-700 transition-all text-base sm:text-lg"
                                >
                                    Cancel
                                </button>
                            </div>
                        </div>
                    )}

                    {previewUrl && !result && (
                        <div className="space-y-4">
                            <div className="relative rounded-xl overflow-hidden bg-gray-100">
                                <img src={previewUrl} alt="Selected food" className="w-full h-auto max-h-[60vh] sm:max-h-96 object-contain" />
                            </div>
                            <div className="flex flex-col sm:flex-row gap-3 sm:gap-4">
                                <button
                                    onClick={analyzeFood}
                                    disabled={analyzing}
                                    className="flex-1 px-6 py-3.5 sm:py-3 bg-gradient-to-r from-indigo-600 to-purple-600 text-white rounded-lg font-semibold hover:from-indigo-700 hover:to-purple-700 active:scale-95 transition-all shadow-md hover:shadow-lg disabled:opacity-50 disabled:cursor-not-allowed disabled:active:scale-100 text-base touch-manipulation"
                                >
                                    {analyzing ? (
                                        <span className="flex items-center justify-center gap-2">
                                            <svg className="animate-spin h-5 w-5" fill="none" viewBox="0 0 24 24">
                                                <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                                                <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                                            </svg>
                                            Analyzing...
                                        </span>
                                    ) : (
                                        '🔍 Analyze Food'
                                    )}
                                </button>
                                <button
                                    onClick={resetScanner}
                                    className="px-6 py-3.5 sm:py-3 bg-gray-200 text-gray-700 rounded-lg font-semibold hover:bg-gray-300 active:scale-95 transition-all text-base touch-manipulation"
                                >
                                    Reset
                                </button>
                            </div>
                        </div>
                    )}

                    {error && (
                        <div className="bg-red-50 border border-red-200 rounded-lg p-4 flex items-start gap-3">
                            <svg className="w-6 h-6 text-red-600 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                            </svg>
                            <div>
                                <h3 className="text-sm font-semibold text-red-900">Error</h3>
                                <p className="text-sm text-red-700">{error}</p>
                            </div>
                        </div>
                    )}

                    {result && (
                        <div className="space-y-4">
                            <div className="relative rounded-xl overflow-hidden mb-4 bg-gray-100">
                                <img src={previewUrl} alt="Analyzed food" className="w-full h-auto max-h-48 sm:max-h-64 object-contain" />
                            </div>

                            <div className="bg-gradient-to-r from-green-50 to-emerald-50 border border-green-200 rounded-xl p-4 sm:p-6">
                                <div className="flex items-start sm:items-center gap-3 mb-4">
                                    <div className="w-10 h-10 sm:w-12 sm:h-12 bg-green-500 rounded-full flex items-center justify-center flex-shrink-0">
                                        <svg className="w-5 h-5 sm:w-6 sm:h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                                        </svg>
                                    </div>
                                    <div>
                                        <h3 className="text-lg sm:text-xl font-bold text-gray-900">Analysis Complete!</h3>
                                        <p className="text-xs sm:text-sm text-gray-600">Results from Gemini AI</p>
                                    </div>
                                </div>

                                <div className="bg-white rounded-lg p-4 sm:p-6 shadow-sm max-h-[50vh] overflow-y-auto">
                                    <pre className="text-xs sm:text-sm text-gray-800 whitespace-pre-wrap font-mono break-words">
                                        {result.analysis}
                                    </pre>
                                </div>
                            </div>

                            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                                <button
                                    onClick={openLogModal}
                                    className="w-full px-6 py-3.5 bg-green-600 text-white rounded-lg font-semibold hover:bg-green-700 active:scale-95 transition-all shadow-md hover:shadow-lg text-base touch-manipulation flex items-center justify-center gap-2"
                                >
                                    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6v6m0 0v6m0-6h6m-6 0H6" />
                                    </svg>
                                    Log This Meal
                                </button>
                                <button
                                    onClick={resetScanner}
                                    className="w-full px-6 py-3.5 bg-gradient-to-r from-indigo-600 to-purple-600 text-white rounded-lg font-semibold hover:from-indigo-700 hover:to-purple-700 active:scale-95 transition-all shadow-md hover:shadow-lg text-base touch-manipulation"
                                >
                                    🔄 Scan Another Food
                                </button>
                            </div>
                        </div>
                    )}
                </div>

                <canvas ref={canvasRef} className="hidden" />
            </main>

            {showLogModal && (
                <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
                    <div className="bg-white rounded-2xl shadow-2xl max-w-2xl w-full max-h-[90vh] overflow-y-auto">
                        <div className="p-6">
                            <div className="flex justify-between items-center mb-6">
                                <h2 className="text-2xl font-bold text-gray-800">Log Scanned Meal</h2>
                                <button
                                    onClick={() => setShowLogModal(false)}
                                    className="text-gray-500 hover:text-gray-700 text-2xl"
                                >
                                    ×
                                </button>
                            </div>

                            <form onSubmit={handleLogMeal} className="space-y-4">
                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-2">
                                        Meal Type *
                                    </label>
                                    <select
                                        value={logFormData.meal_type}
                                        onChange={(e) => setLogFormData({ ...logFormData, meal_type: e.target.value })}
                                        className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent"
                                        required
                                    >
                                        <option value="breakfast">Breakfast</option>
                                        <option value="lunch">Lunch</option>
                                        <option value="dinner">Dinner</option>
                                        <option value="snack">Snack</option>
                                    </select>
                                </div>

                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-2">
                                        Food Name *
                                    </label>
                                    <input
                                        type="text"
                                        value={logFormData.food_name}
                                        onChange={(e) => setLogFormData({ ...logFormData, food_name: e.target.value })}
                                        placeholder="e.g., Grilled Chicken Breast"
                                        className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent"
                                        required
                                    />
                                </div>

                                <div className="grid grid-cols-2 gap-4">
                                    <div>
                                        <label className="block text-sm font-medium text-gray-700 mb-2">
                                            Calories *
                                        </label>
                                        <input
                                            type="number"
                                            value={logFormData.calories}
                                            onChange={(e) => setLogFormData({ ...logFormData, calories: e.target.value })}
                                            step="0.1"
                                            min="0"
                                            placeholder="0"
                                            className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent"
                                            required
                                        />
                                    </div>
                                    <div>
                                        <label className="block text-sm font-medium text-gray-700 mb-2">
                                            Protein (g)
                                        </label>
                                        <input
                                            type="number"
                                            value={logFormData.protein_g}
                                            onChange={(e) => setLogFormData({ ...logFormData, protein_g: e.target.value })}
                                            step="0.1"
                                            min="0"
                                            placeholder="0"
                                            className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent"
                                        />
                                    </div>
                                    <div>
                                        <label className="block text-sm font-medium text-gray-700 mb-2">
                                            Carbs (g)
                                        </label>
                                        <input
                                            type="number"
                                            value={logFormData.carbs_g}
                                            onChange={(e) => setLogFormData({ ...logFormData, carbs_g: e.target.value })}
                                            step="0.1"
                                            min="0"
                                            placeholder="0"
                                            className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent"
                                        />
                                    </div>
                                    <div>
                                        <label className="block text-sm font-medium text-gray-700 mb-2">
                                            Fat (g)
                                        </label>
                                        <input
                                            type="number"
                                            value={logFormData.fat_g}
                                            onChange={(e) => setLogFormData({ ...logFormData, fat_g: e.target.value })}
                                            step="0.1"
                                            min="0"
                                            placeholder="0"
                                            className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent"
                                        />
                                    </div>
                                </div>

                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-2">
                                        Serving Size
                                    </label>
                                    <input
                                        type="text"
                                        value={logFormData.serving_size}
                                        onChange={(e) => setLogFormData({ ...logFormData, serving_size: e.target.value })}
                                        placeholder="e.g., 1 cup, 100g, 2 slices"
                                        className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent"
                                    />
                                </div>

                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-2">
                                        Notes (AI Analysis)
                                    </label>
                                    <textarea
                                        value={logFormData.notes}
                                        onChange={(e) => setLogFormData({ ...logFormData, notes: e.target.value })}
                                        rows="4"
                                        placeholder="AI analysis will appear here..."
                                        className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent text-sm"
                                    ></textarea>
                                </div>

                                <div className="flex gap-4 pt-4">
                                    <button
                                        type="submit"
                                        className="flex-1 px-6 py-3 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors font-medium"
                                    >
                                        Log Meal
                                    </button>
                                    <button
                                        type="button"
                                        onClick={() => setShowLogModal(false)}
                                        className="px-6 py-3 bg-gray-200 text-gray-700 rounded-lg hover:bg-gray-300 transition-colors font-medium"
                                    >
                                        Cancel
                                    </button>
                                </div>
                            </form>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
}
