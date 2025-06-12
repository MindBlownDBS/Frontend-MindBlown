import { checkTodayEntry, getEntryByDate, saveEntry, getUserRecommendations, regenerateRecommendations, getMonthlyTrackerEntries } from '../../data/api';

export default class MindTracakerPresenter {
    constructor() {
        this.currentDate = new Date();
        this.monthNames = [
            'January', 'February', 'March', 'April', 'May', 'June',
            'July', 'August', 'September', 'October', 'November', 'December'
        ];
        this.userRecommendations = [];
        this.monthlyEntries = [];
        this.currentMonthOffset = 0; 
    }

    async checkTodayEntry() {
        try {
            const result = await checkTodayEntry();
            console.log(result)
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

  async loadMonthlyEntries() {
    try {
        const result = await getMonthlyTrackerEntries(this.currentMonthOffset);
        console.log('Presenter: Loaded monthly entries:', result);
        if (result.error) {
            throw new Error(result.message);
        }

        this.monthlyEntries = result.data.monthlyDetails || [];
        return {
            weekRange: result.data.monthRange || {
                start: '',
                end: '',
                month: ''
            },
            entries: this.monthlyEntries || []
        };
    } catch (error) {
        console.error('Presenter: Error loading monthly entries:', error);
        return {
            weekRange: { 
                start: '', 
                end: '', 
                month: ''
            },
            entries: []
        };
    }
}

    async loadPreviousMonthEntries() {
        this.currentMonthOffset -= 1;
        return this.loadMonthlyEntries();
    }

    async loadNextMonthEntries() {
        if (this.currentMonthOffset < 0) {
            this.currentMonthOffset += 1;
        } else if (this.currentMonthOffset === 0) {
            return this.loadMonthlyEntries();
        }
        return this.loadMonthlyEntries();
    }

    getMonthlyEntries() {
        return this.monthlyEntries;
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