'use client';

import { createContext, useContext, useState, useEffect } from 'react';
import { api } from '@/lib/api';
import { useRouter } from 'next/navigation';

const AuthContext = createContext({});

export function AuthProvider({ children }) {
    const [user, setUser] = useState(null);
    const [loading, setLoading] = useState(true);
    const router = useRouter();

    useEffect(() => {
        checkAuth();
    }, []);

    const checkAuth = async () => {
        try {
            const token = api.getToken();
            if (token) {
                const userData = await api.getCurrentUser();
                setUser(userData);
            }
        } catch (error) {
            console.error('Auth check failed:', error);
            api.removeToken();
        } finally {
            setLoading(false);
        }
    };

    const login = (token, userData) => {
        api.setToken(token);
        setUser(userData);
        router.push('/my');
    };

    const logout = async () => {
        try {
            await api.logout();
        } catch (error) {
            console.error('Logout failed:', error);
        }
        api.removeToken();
        setUser(null);
        router.push('/');
    };

    return (
        <AuthContext.Provider value={{ user, loading, login, logout, checkAuth }}>
            {children}
        </AuthContext.Provider>
    );
}

export const useAuth = () => useContext(AuthContext);
