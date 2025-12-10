/**
 * Web Notifications Utility
 * Handles browser push notifications for meal reminders and achievements
 */

class NotificationManager {
    constructor() {
        this.permission = 'default';
        this.isSupported = typeof window !== 'undefined' && 'Notification' in window;
    }

    /**
     * Check if notifications are supported
     */
    isNotificationSupported() {
        return this.isSupported;
    }

    /**
     * Get current notification permission status
     */
    getPermission() {
        if (!this.isSupported) return 'denied';
        return Notification.permission;
    }

    /**
     * Request notification permission from user
     */
    async requestPermission() {
        if (!this.isSupported) {
            console.warn('Notifications are not supported in this browser');
            return 'denied';
        }

        try {
            const permission = await Notification.requestPermission();
            this.permission = permission;
            return permission;
        } catch (error) {
            console.error('Error requesting notification permission:', error);
            return 'denied';
        }
    }

    /**
     * Show a notification
     * @param {string} title - Notification title
     * @param {object} options - Notification options
     */
    async showNotification(title, options = {}) {
        if (!this.isSupported) {
            console.warn('Notifications are not supported');
            return null;
        }

        if (Notification.permission === 'default') {
            await this.requestPermission();
        }

        if (Notification.permission !== 'granted') {
            console.warn('Notification permission not granted');
            return null;
        }

        const defaultOptions = {
            icon: '/icon-192.png',
            badge: '/icon-192.png',
            vibrate: [200, 100, 200],
            requireInteraction: false,
            ...options,
        };

        try {
            const notification = new Notification(title, defaultOptions);

            if (!options.requireInteraction) {
                setTimeout(() => notification.close(), 5000);
            }

            return notification;
        } catch (error) {
            console.error('Error showing notification:', error);
            return null;
        }
    }

    /**
     * Show meal reminder notification
     */
    async showMealReminder(mealType, targetCalories) {
        const mealEmojis = {
            breakfast: '🍳',
            lunch: '🍱',
            dinner: '🍽️',
            snack: '🍎',
        };

        const emoji = mealEmojis[mealType] || '🍴';
        const mealName = mealType.charAt(0).toUpperCase() + mealType.slice(1);

        return this.showNotification(`${emoji} Time for ${mealName}!`, {
            body: `Don't forget to log your meal. Target: ${targetCalories} calories`,
            tag: `meal-reminder-${mealType}`,
            data: { type: 'meal-reminder', mealType },
        });
    }

    /**
     * Show daily summary notification
     */
    async showDailySummary(consumed, target, mealsLogged) {
        const percentage = Math.round((consumed / target) * 100);
        let emoji = '📊';
        let message = '';

        if (percentage >= 90 && percentage <= 110) {
            emoji = '🎯';
            message = 'Perfect! You hit your target!';
        } else if (percentage < 90) {
            emoji = '📉';
            message = `${target - consumed} calories remaining`;
        } else {
            emoji = '📈';
            message = `${consumed - target} calories over target`;
        }

        return this.showNotification(`${emoji} Daily Summary`, {
            body: `${message}\n${mealsLogged} meals logged today\n${consumed}/${target} calories`,
            tag: 'daily-summary',
            data: { type: 'daily-summary' },
            requireInteraction: true,
        });
    }

    /**
     * Show achievement notification
     */
    async showAchievement(achievementType, details) {
        const achievements = {
            streak: {
                emoji: '🔥',
                title: 'Streak Achievement!',
                body: `${details.days} days of consistent tracking! Keep it up!`,
            },
            goal_reached: {
                emoji: '🎉',
                title: 'Goal Reached!',
                body: `You've hit your ${details.goal} goal! Amazing work!`,
            },
            perfect_week: {
                emoji: '⭐',
                title: 'Perfect Week!',
                body: 'You stayed within your targets all week!',
            },
            milestone: {
                emoji: '🏆',
                title: 'Milestone Unlocked!',
                body: details.message,
            },
        };

        const achievement = achievements[achievementType] || {
            emoji: '🎊',
            title: 'Achievement Unlocked!',
            body: details.message || 'Great job!',
        };

        return this.showNotification(
            `${achievement.emoji} ${achievement.title}`,
            {
                body: achievement.body,
                tag: `achievement-${achievementType}`,
                data: { type: 'achievement', achievementType },
                requireInteraction: true,
            }
        );
    }

    /**
     * Show custom notification
     */
    async showCustom(emoji, title, body, tag = null) {
        return this.showNotification(`${emoji} ${title}`, {
            body,
            tag: tag || `custom-${Date.now()}`,
            data: { type: 'custom' },
        });
    }

    /**
     * Show a toast success message (in-app notification)
     * @param {string} message - The message to display
     */
    success(message) {
        this._showToast(message, 'success');
    }

    /**
     * Show a toast error message (in-app notification)
     * @param {string} message - The message to display
     */
    error(message) {
        this._showToast(message, 'error');
    }

    /**
     * Show a toast info message (in-app notification)
     * @param {string} message - The message to display
     */
    info(message) {
        this._showToast(message, 'info');
    }

    /**
     * Internal method to create and show toast notifications
     * @private
     */
    _showToast(message, type = 'info') {
        if (typeof window === 'undefined') return;

        const existingToast = document.querySelector(`.toast-notification.toast-${type}`);
        if (existingToast) {
            existingToast.remove();
        }

        const toast = document.createElement('div');
        toast.className = `toast-notification toast-${type}`;

        const styles = {
            success: {
                bg: 'rgba(34, 197, 94, 0.95)',
                icon: '✓',
                iconBg: 'rgba(255, 255, 255, 0.2)'
            },
            error: {
                bg: 'rgba(239, 68, 68, 0.95)',
                icon: '✕',
                iconBg: 'rgba(255, 255, 255, 0.2)'
            },
            info: {
                bg: 'rgba(59, 130, 246, 0.95)',
                icon: 'ℹ',
                iconBg: 'rgba(255, 255, 255, 0.2)'
            }
        };

        const style = styles[type] || styles.info;

        toast.style.cssText = `
            position: fixed;
            top: 24px;
            right: 24px;
            background: ${style.bg};
            backdrop-filter: blur(12px);
            color: white;
            padding: 16px 20px;
            border-radius: 16px;
            box-shadow: 0 10px 40px rgba(0, 0, 0, 0.15);
            z-index: 9999;
            max-width: 400px;
            display: flex;
            align-items: center;
            gap: 12px;
            font-family: system-ui, -apple-system, sans-serif;
            font-size: 14px;
            font-weight: 500;
            animation: toastSlideIn 0.3s ease-out;
        `;

        toast.innerHTML = `
            <div style="
                width: 28px;
                height: 28px;
                background: ${style.iconBg};
                border-radius: 50%;
                display: flex;
                align-items: center;
                justify-content: center;
                font-size: 14px;
                flex-shrink: 0;
            ">${style.icon}</div>
            <span style="flex: 1;">${message}</span>
        `;

        if (!document.querySelector('#toast-animations')) {
            const styleSheet = document.createElement('style');
            styleSheet.id = 'toast-animations';
            styleSheet.textContent = `
                @keyframes toastSlideIn {
                    from {
                        transform: translateX(100%);
                        opacity: 0;
                    }
                    to {
                        transform: translateX(0);
                        opacity: 1;
                    }
                }
                @keyframes toastSlideOut {
                    from {
                        transform: translateX(0);
                        opacity: 1;
                    }
                    to {
                        transform: translateX(100%);
                        opacity: 0;
                    }
                }
            `;
            document.head.appendChild(styleSheet);
        }

        document.body.appendChild(toast);

        setTimeout(() => {
            toast.style.animation = 'toastSlideOut 0.3s ease-in forwards';
            setTimeout(() => toast.remove(), 300);
        }, 4000);
    }

    /**
     * Schedule meal reminders based on user preferences
     * @param {Array} mealTimes - Array of {mealType, time} objects
     * @param {number} targetCalories - Daily target calories
     */
    scheduleMealReminders(mealTimes, targetCalories) {
        if (!this.isSupported || Notification.permission !== 'granted') {
            return;
        }

        this.clearScheduledReminders();

        const now = new Date();
        const scheduledReminders = [];

        mealTimes.forEach(({ mealType, time }) => {
            const [hours, minutes] = time.split(':').map(Number);
            const scheduledTime = new Date(now);
            scheduledTime.setHours(hours, minutes, 0, 0);

            if (scheduledTime <= now) {
                scheduledTime.setDate(scheduledTime.getDate() + 1);
            }

            const delay = scheduledTime - now;
            const mealCalories = Math.round(targetCalories / 3);
            const timerId = setTimeout(() => {
                this.showMealReminder(mealType, mealCalories);

                this.scheduleMealReminders(mealTimes, targetCalories);
            }, delay);

            scheduledReminders.push(timerId);
        });

        if (typeof window !== 'undefined') {
            window.__mealReminderTimers = scheduledReminders;
        }
    }

    /**
     * Clear all scheduled reminders
     */
    clearScheduledReminders() {
        if (typeof window !== 'undefined' && window.__mealReminderTimers) {
            window.__mealReminderTimers.forEach(timerId => clearTimeout(timerId));
            window.__mealReminderTimers = [];
        }
    }

    /**
     * Check if daily summary should be shown
     * @param {object} dailyData - Daily meal data
     * @param {object} healthProfile - User's health profile
     */
    async checkAndShowDailySummary(dailyData, healthProfile) {
        if (!this.isSupported || Notification.permission !== 'granted') {
            return;
        }

        const now = new Date();
        const lastShown = localStorage.getItem('last-daily-summary');
        const today = now.toISOString().split('T')[0];

        if (lastShown === today || now.getHours() !== 21) {
            return;
        }

        const consumed = dailyData.daily_totals?.consumed?.calories || 0;
        const target = healthProfile.daily_calories;
        const mealsLogged = dailyData.meals?.length || 0;

        if (mealsLogged > 0) {
            await this.showDailySummary(consumed, target, mealsLogged);
            localStorage.setItem('last-daily-summary', today);
        }
    }

    /**
     * Check for achievements based on user's tracking data
     * @param {Array} weeklyData - Last 7 days of meal data
     * @param {object} healthProfile - User's health profile
     */
    async checkAchievements(weeklyData, healthProfile) {
        if (!this.isSupported || Notification.permission !== 'granted') {
            return;
        }

        const daysWithMeals = weeklyData.filter(day =>
            day.meals && day.meals.length > 0
        ).length;

        if (daysWithMeals === 7) {
            const lastStreakShown = localStorage.getItem('last-streak-achievement');
            const today = new Date().toISOString().split('T')[0];

            if (lastStreakShown !== today) {
                await this.showAchievement('streak', { days: 7 });
                localStorage.setItem('last-streak-achievement', today);
            }
        }

        const targetCalories = healthProfile.daily_calories;
        const perfectDays = weeklyData.filter(day => {
            const consumed = day.daily_totals?.consumed?.calories || 0;
            if (consumed === 0) return false;
            const diff = Math.abs(consumed - targetCalories);
            return diff <= targetCalories * 0.1;
        }).length;

        if (perfectDays === 7) {
            const lastPerfectWeek = localStorage.getItem('last-perfect-week');
            const thisWeek = `${new Date().getFullYear()}-W${Math.ceil(new Date().getDate() / 7)}`;

            if (lastPerfectWeek !== thisWeek) {
                await this.showAchievement('perfect_week', {});
                localStorage.setItem('last-perfect-week', thisWeek);
            }
        }
    }
}

export const notificationManager = new NotificationManager();

export { NotificationManager };
