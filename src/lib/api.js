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

            const text = await response.text();

            console.log('API Response:', {
                endpoint,
                status: response.status,
                statusText: response.statusText,
                textLength: text.length,
                textPreview: text.substring(0, 200)
            });

            let data;
            try {
                data = JSON.parse(text);
            } catch (parseError) {
                console.error('Failed to parse JSON response:', text);
                throw new Error(`Server returned invalid JSON (${response.status} ${response.statusText}): ${text.substring(0, 100)}`);
            }

            if (!response.ok) {
                throw new Error(data.error || 'Something went wrong');
            }

            return data;
        } catch (error) {
            console.error('API request failed:', error);
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

    async analyzeFoodText(foodDescription) {
        return this.request('/nutrition/analyze-text', {
            method: 'POST',
            body: JSON.stringify({ food_description: foodDescription }),
        });
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

    async searchNutrition(query) {
        return this.getNutritionInfo(query);
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

    async searchRecipes(query) {
        const params = new URLSearchParams({ query });
        return this.request(`/recipes/search?${params.toString()}`);
    }

    async getRecipeById(mealId) {
        return this.request(`/recipes/${mealId}`);
    }

    async getRandomRecipes(count = 6) {
        const params = new URLSearchParams({ count: count.toString() });
        return this.request(`/recipes/random?${params.toString()}`);
    }

    async filterRecipesByCategory(category) {
        return this.request(`/recipes/category/${category}`);
    }

    async filterRecipesByArea(area) {
        return this.request(`/recipes/area/${area}`);
    }

    async createHealthProfile(profileData) {
        return this.request('/health/profile', {
            method: 'POST',
            body: JSON.stringify(profileData),
        });
    }

    async getHealthProfile() {
        return this.request('/health/profile');
    }

    async logMeal(mealData) {
        return this.request('/meals/log', {
            method: 'POST',
            body: JSON.stringify(mealData),
        });
    }

    async getDailyMeals(date) {
        const params = date ? new URLSearchParams({ date }) : '';
        return this.request(`/meals/daily${params ? '?' + params.toString() : ''}`);
    }

    async updateMeal(mealId, mealData) {
        return this.request(`/meals/${mealId}`, {
            method: 'PUT',
            body: JSON.stringify(mealData),
        });
    }

    async deleteMeal(mealId) {
        return this.request(`/meals/${mealId}`, {
            method: 'DELETE',
        });
    }

    async getPeriodStats(startDate, endDate) {
        const params = new URLSearchParams({
            start_date: startDate,
            end_date: endDate,
        });
        return this.request(`/meals/period-stats?${params.toString()}`);
    }

    async generateReport(reportType, startDate, endDate, sendEmail = false) {
        const params = new URLSearchParams({
            report_type: reportType,
            start_date: startDate,
            end_date: endDate,
            send_email: sendEmail.toString(),
        });
        return this.request(`/reports/generate?${params.toString()}`, {
            method: 'POST',
        });
    }

    async getReports(limit = 50, skip = 0) {
        const params = new URLSearchParams({
            limit: limit.toString(),
            skip: skip.toString(),
        });
        return this.request(`/reports?${params.toString()}`);
    }

    async getReportById(reportId) {
        return this.request(`/reports/${reportId}`);
    }

    async deleteReport(reportId) {
        return this.request(`/reports/${reportId}`, {
            method: 'DELETE',
        });
    }
}

export const api = new ApiClient();
