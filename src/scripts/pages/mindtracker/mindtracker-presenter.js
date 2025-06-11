import { checkTodayEntry, getEntryByDate, saveEntry, getUserRecommendations, regenerateRecommendations, getWeeklyTrackerEntries } from '../../data/api';

export default class MindTracakerPresenter {
    constructor() {
        this.currentDate = new Date();
        this.monthNames = [
            'January', 'February', 'March', 'April', 'May', 'June',
            'July', 'August', 'September', 'October', 'November', 'December'
        ];
        this.userRecommendations = [];
        this.weeklyEntries = [];
        this.currentWeekOffset = 0;
    }

    async checkTodayEntry() {
        try {
            const result = await checkTodayEntry();
            return {
                exists: result.exists,
                formattedDate: this.formatDate(this.currentDate)
            };
        } catch (error) {
            console.error('Presenter: Error checking today entry:', error);
            throw error;
        }
    }

    async getEntryByDate(dateStr) {
        try {

            const result = await getEntryByDate(dateStr);
            return {
                data: result.data,
                formattedDate: this.formatDate(new Date(dateStr))
            };
        } catch (error) {
            console.error('Presenter: Error getting entry by date:', error);
            throw error;
        }
    }

    async saveEntry(data) {
        try {
            const result = await saveEntry(data);
            return result;
        } catch (error) {
            console.error('Presenter: Error saving entry:', error);
            throw error;
        }
    }

    async loadRecommendations() {
        try {
            const user = JSON.parse(localStorage.getItem('user')) || {};
            if (!user.username) {
                throw new Error('User data not found');
            }

            const result = await getUserRecommendations(user.username);
            if (result.error) {
                throw new Error(result.message);
            }

            this.userRecommendations = result.data.recommendations || [];

            return this.userRecommendations;
        } catch (error) {
            console.error('Presenter: Error loading recommendations:', error);
            return [];
        }
    }

    async regenerateRecommendations() {
        try {

            const user = JSON.parse(localStorage.getItem('user')) || {};
            if (!user.username) {
                throw new Error('User data not found');
            }

            const result = await regenerateRecommendations(user.username);

            if (result.error) {
                throw new Error(result.message || "Failed to regenerate recommendations");
            }

            return await this.loadRecommendations();
        } catch (error) {
            console.error('Presenter: Error regenerating recommendations:', error);
            throw error;
        }
    }

    // async loadWeeklyEntries() {
    //     try {
    //         const result = await getWeeklyTrackerEntries();
    //         if (result.error) {
    //             throw new Error(result.message);
    //         }

    //         this.weeklyEntries = result.data.weeklyDetails || [];
    //         return {
    //             weekRange: result.data.weekRange,
    //             entries: this.weeklyEntries
    //         };
    //     } catch (error) {
    //         console.error('Presenter: Error loading weekly entries:', error);
    //         return {
    //             weekRange: { start: '', end: '' },
    //             entries: []
    //         };
    //     }
    // }

    async loadWeeklyEntries() {
        try {
            // Get params for API call - we could modify the URL to include week offset
            // For now, let's assume the API always returns the current week
            const result = await getWeeklyTrackerEntries(this.currentWeekOffset);
            console.log('Presenter: Loaded weekly entries:', result);
            if (result.error) {
                throw new Error(result.message);
            }

            this.weeklyEntries = result.data.weeklyDetails || [];
            return {
                weekRange: result.data.weekRange,
                entries: this.weeklyEntries
            };
        } catch (error) {
            console.error('Presenter: Error loading weekly entries:', error);
            return {
                weekRange: { start: '', end: '' },
                entries: []
            };
        }
    }

    async loadPreviousWeekEntries() {
        this.currentWeekOffset -= 1;
        return this.loadWeeklyEntries();
    }

    async loadNextWeekEntries() {
        if (this.currentWeekOffset < 0) {
            this.currentWeekOffset += 1;
        } else if (this.currentWeekOffset === 0) {
            // Don't allow going to future weeks
            return this.loadWeeklyEntries();
        }
        return this.loadWeeklyEntries();
    }

    getWeeklyEntries() {
        return this.weeklyEntries;
    }

    getMoodEmoji(mood) {
        const moodMap = {
            'joy': '😄',
            'neutral': '😐',
            'sadness': '😔',
            'anger': '😠',
        };

        return moodMap[mood] || '❓';
    }

    getRecommendations() {
        return this.userRecommendations || [];
    }

    getCurrentDate() {
        return this.currentDate;
    }

    setCurrentDate(date) {
        this.currentDate = date;
    }

    getMonthNames() {
        return this.monthNames;
    }

    formatDate(date) {
        return date.toLocaleDateString('id-ID', {
            day: 'numeric',
            month: 'long',
            year: 'numeric'
        });
    }

    parseDateString(dateStr) {
        const [_, day, month, year] = dateStr.match(/(\d+)\s+(\w+)\s+(\d+)/);
        const monthMap = {
            'Januari': 0, 'Februari': 1, 'Maret': 2, 'April': 3,
            'Mei': 4, 'Juni': 5, 'Juli': 6, 'Agustus': 7,
            'September': 8, 'Oktober': 9, 'November': 10, 'Desember': 11
        };
        return new Date(year, monthMap[month], day);
    }
}