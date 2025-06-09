import { checkTodayEntry, getEntryByDate, saveEntry, getUserRecommendations, regenerateRecommendations } from '../../data/api';

export default class CalendarPresenter {
    constructor() {
        this.currentDate = new Date();
        this.monthNames = [
            'January', 'February', 'March', 'April', 'May', 'June',
            'July', 'August', 'September', 'October', 'November', 'December'
        ];
        this.userRecommendations = [];
    }

    async checkTodayEntry() {
        try {
            console.log('Presenter: Checking today entry');
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
            console.log('Presenter: Getting entry for date:', dateStr);
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
            console.log('Presenter: Saving entry data:', data);
            const result = await saveEntry(data);
            console.log('Presenter: Save entry result:', result);
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
            console.log('Loaded recommendations:', this.userRecommendations);
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
    
    console.log("Regenerating recommendations for username:", user.username);
    
    const result = await regenerateRecommendations(user.username);
    console.log("API response for regeneration:", result);
    
    if (result.error) {
      throw new Error(result.message || "Failed to regenerate recommendations");
    }
    
    return await this.loadRecommendations();
  } catch (error) {
    console.error('Presenter: Error regenerating recommendations:', error);
    throw error;
  }
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