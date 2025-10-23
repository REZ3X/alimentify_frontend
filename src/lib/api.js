const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:4000/api';

class ApiClient {
    constructor() {
        this.baseUrl = API_BASE_URL;
    }

    getToken() {
        if (typeof window !== 'undefined') {
            return localStorage.getItem('auth_token');
        }
        return null;
    }

    setToken(token) {
        if (typeof window !== 'undefined') {
            localStorage.setItem('auth_token', token);
        }
    }

    removeToken() {
        if (typeof window !== 'undefined') {
            localStorage.removeItem('auth_token');
        }
    }

    async request(endpoint, options = {}) {
        const token = this.getToken();
        const headers = {
            'Content-Type': 'application/json',
            ...options.headers,
        };

        if (token) {
            headers['Authorization'] = `Bearer ${token}`;
        }

        const config = {
            ...options,
            headers,
        };

        try {
            const response = await fetch(`${this.baseUrl}${endpoint}`, config);
            const data = await response.json();

            if (!response.ok) {
                throw new Error(data.error || 'Something went wrong');
            }

            return data;
        } catch (error) {
            throw error;
        }
    }

    async getGoogleAuthUrl() {
        return this.request('/auth/google');
    }

    async getCurrentUser() {
        return this.request('/auth/me');
    }

    async logout() {
        await this.request('/auth/logout', { method: 'POST' });
        this.removeToken();
    }

    async verifyEmail(token) {
        return this.request(`/auth/verify-email?token=${token}`);
    }

    async analyzeFoodImage(imageFile) {
        const formData = new FormData();
        formData.append('image', imageFile);

        const token = this.getToken();
        const headers = {};
        if (token) {
            headers['Authorization'] = `Bearer ${token}`;
        }

        const response = await fetch(`${this.baseUrl}/nutrition/analyze`, {
            method: 'POST',
            headers,
            body: formData,
        });

        const data = await response.json();
        if (!response.ok) {
            throw new Error(data.error || 'Failed to analyze food image');
        }

        return data;
    }

    async quickFoodCheck(imageFile) {
        const formData = new FormData();
        formData.append('image', imageFile);

        const token = this.getToken();
        const headers = {};
        if (token) {
            headers['Authorization'] = `Bearer ${token}`;
        }

        const response = await fetch(`${this.baseUrl}/nutrition/quick-check`, {
            method: 'POST',
            headers,
            body: formData,
        });

        const data = await response.json();
        if (!response.ok) {
            throw new Error(data.error || 'Failed to check food');
        }

        return data;
    }

    async getNutritionInfo(query) {
        const params = new URLSearchParams({ query });
        return this.request(`/nutrition-info?${params.toString()}`);
    }

    async searchFoods(query, options = {}) {
        const params = new URLSearchParams({
            query,
            ...(options.pageNumber && { pageNumber: options.pageNumber }),
            ...(options.pageSize && { pageSize: options.pageSize }),
            ...(options.dataType && { dataType: options.dataType }),
        });

        return this.request(`/food-wiki/search?${params.toString()}`);
    }

    async getFoodDetails(fdcId) {
        return this.request(`/food-wiki/${fdcId}`);
    }

    async getFoods(fdcIds) {
        return this.request('/food-wiki/foods', {
            method: 'POST',
            body: JSON.stringify({ fdcIds }),
        });
    }
}

export const api = new ApiClient();
