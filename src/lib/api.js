const getBaseUrl = () => {
    if (typeof window !== 'undefined') {
        return '/api/proxy';
    }
    return process.env.BACKEND_URL ? `${process.env.BACKEND_URL}/api` : '/api/proxy';
};

class ApiClient {
    constructor() {
        this.baseUrl = null;
    }

    getBaseUrl() {
        if (!this.baseUrl) {
            this.baseUrl = getBaseUrl();
        }
        return this.baseUrl;
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
            const response = await fetch(`${this.getBaseUrl()}${endpoint}`, config);

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

        const response = await fetch(`${this.getBaseUrl()}/nutrition/analyze`, {
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

        const response = await fetch(`${this.getBaseUrl()}/nutrition/quick-check`, {
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

    async getUserReports(limit = 50) {
        const params = new URLSearchParams({ limit: limit.toString() });
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

    async get(endpoint) {
        return this.request(endpoint, {
            method: 'GET',
        });
    }

    async post(endpoint, data) {
        return this.request(endpoint, {
            method: 'POST',
            body: JSON.stringify(data),
        });
    }

    async put(endpoint, data) {
        return this.request(endpoint, {
            method: 'PUT',
            body: JSON.stringify(data),
        });
    }

    async delete(endpoint) {
        return this.request(endpoint, {
            method: 'DELETE',
        });
    }

    async createChatSession(initialMessage = null) {
        const payload = initialMessage ? { initial_message: initialMessage } : {};
        return this.post('/chat/sessions', payload);
    }

    async getChatSessions() {
        return this.get('/chat/sessions');
    }

    async getChatSession(sessionId) {
        return this.get(`/chat/sessions/${sessionId}`);
    }

    async deleteChatSession(sessionId) {
        return this.delete(`/chat/sessions/${sessionId}`);
    }

    async sendChatMessage(sessionId, message, imageData = null, mimeType = null) {
        const payload = { message };
        if (imageData) {
            payload.image_data = imageData;
            payload.mime_type = mimeType;
        }
        return this.post(`/chat/sessions/${sessionId}/messages`, payload);
    }

    async getChatMessages(sessionId) {
        return this.get(`/chat/sessions/${sessionId}/messages`);
    }
}

export const api = new ApiClient();
