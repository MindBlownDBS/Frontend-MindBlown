import { mindTrackerModalTemplate, activityRecommendationsTemplate, showToast } from '../templates';
import { generateCalendar } from '../../utils/generate-calendar';
import { weeklyMoodTrackerTemplate } from '../templates';
import MindTrackerPresenter from './mindtracker-presenter';

export default class MindTrackerPage {
    constructor() {
        this.presenter = new MindTrackerPresenter();
    }

    async render() {
        const moods = [
            { date: 'Kamis, 1 Mei', emoji: '🙂' },
            { date: 'Jumat, 2 Mei', emoji: '😊' },
            { date: 'Sabtu, 3 Mei', emoji: '😄' },
            { date: 'Minggu, 4 Mei', emoji: '🤗' },
            { date: 'Senin, 5 Mei', emoji: '🤔' },
        ];

        return `
        <div class="p-4 lg:p-10 pb-20 lg:pb-10 md:pb-10">
        <div class="max-w-md md:max-w-[90%] ml-0 md:ml-16 lg:ml-16 mx-auto">
            <div class="mb-4">
                <h1 class="text-2xl font-semibold text-gray-900 mb-2">Mind Tracker</h1>
                <p class="text-gray-600 text-sm lg:text-md">Hari ini rasanya gimana? Ini tracker ini buat bantu kamu lebih sadar sama perasaan dan progressmu.</p>
                <hr class="mt-4 text-gray-300">
            </div>

            <div class="mb-6">
                <button id="trackTodayBtn" class="bg-third hover:bg-teal-700 text-white px-3 lg:px-4 py-2 rounded-md flex items-center">
                    <svg class="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                        <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 6v6m0 0v6m0-6h6m-6 0H6"></path>
                    </svg>
                    Yuk Track Your Mind !
                </button>
            </div>

           <div id="recommendations-container">
            ${activityRecommendationsTemplate([])}
        </div>

            <div>
             <h2 class="font-semibold text-base mt-5 mb-1 lg:mb-3">Mood dalam 1 Minggu</h2> 
             ${weeklyMoodTrackerTemplate(moods)}
            </div>

            <div class="flex items-center justify-between py-2">
                <h2 id="monthDisplay" class="text-xl font-semibold text-gray-800">
                    May 2025
                </h2>

                <div class="flex items-center space-x-2">
                    <button id="todayBtn"
                    class="bg-gray-200 text-gray-400 text-sm px-4 py-2 rounded-md">
                    Today
                    </button>

                    <div class="flex rounded-md overflow-hidden border border-gray-200">
                    <button id="prevMonth" class="px-3 py-2 bg-gray-100 hover:bg-gray-200">
                        <svg class="w-4 h-4 text-gray-700" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M15 19l-7-7 7-7" />
                        </svg>
                    </button>
                    <button id="nextMonth" class="px-3 py-2 bg-gray-100 hover:bg-gray-200 border-l border-gray-300">
                        <svg class="w-4 h-4 text-gray-700" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 5l7 7-7 7" />
                        </svg>
                    </button>
                    </div>
                </div>
                </div>


            <div class="bg-white shadow-sm">
                <div class="grid grid-cols-7 gap-0 border-t border-r border-gray-100">
                    <div class="text-xs text-gray-500 text-center py-2 border-t border-r border-gray-100">Su</div>
                    <div class="text-xs text-gray-500 text-center py-2 border-t border-r border-gray-100">Mo</div>
                    <div class="text-xs text-gray-500 text-center py-2 border-t border-r border-gray-100">Tu</div>
                    <div class="text-xs text-gray-500 text-center py-2 border-t border-r border-gray-100">We</div>
                    <div class="text-xs text-gray-500 text-center py-2 border-t border-r border-gray-100">Th</div>
                    <div class="text-xs text-gray-500 text-center py-2 border-t border-r border-gray-100">Fr</div>
                    <div class="text-xs text-gray-500 text-center py-2 border-t border-r border-gray-100">Sa</div>

                    <div id="calendarDays" class="col-span-7 grid grid-cols-7"></div>
                </div>
            </div>
        </div>
    </div>
      `;
    }

    async afterRender() {
        generateCalendar(this.presenter.getCurrentDate(), this.presenter.getMonthNames());

        try {
            const recommendations = await this.presenter.loadRecommendations();
            this.updateRecommendationsSection(recommendations);
            this.setupRegenerateButton();
        } catch (error) {
            console.error('Failed to load recommendations:', error);
        }

        document.getElementById('prevMonth').addEventListener('click', () => {
            const currentDate = this.presenter.getCurrentDate();
            currentDate.setMonth(currentDate.getMonth() - 1);
            this.presenter.setCurrentDate(currentDate);
            generateCalendar(currentDate, this.presenter.getMonthNames());
            this.updateTodayButtonState();
        });

        document.getElementById('nextMonth').addEventListener('click', () => {
            const currentDate = this.presenter.getCurrentDate();
            currentDate.setMonth(currentDate.getMonth() + 1);
            this.presenter.setCurrentDate(currentDate);
            generateCalendar(currentDate, this.presenter.getMonthNames());
            this.updateTodayButtonState();
        });

        document.getElementById('todayBtn').addEventListener('click', () => {
            this.presenter.setCurrentDate(new Date());
            generateCalendar(this.presenter.getCurrentDate(), this.presenter.getMonthNames());
            this.updateTodayButtonState();
        });

        document.getElementById('trackTodayBtn').addEventListener('click', async () => {
            try {
                const result = await this.presenter.checkTodayEntry();

                if (result.exists) {
                    showToast('Anda sudah mengisi Mind Tracker untuk hari ini.', 'error');
                    return;
                }

                this.showModal(result.formattedDate, null, false);
            } catch (error) {
                console.error('Error checking mind tracker entry:', error);
                showToast(error.message || 'Terjadi kesalahan server', 'error');
            }
        });

        document.getElementById('calendarDays').addEventListener('click', async (e) => {
            const dayElement = e.target.closest('div[data-date]');
            if (dayElement) {
                this.handleDayClick(dayElement);
            }
        });
    }

    updateRecommendationsSection(recommendations) {
        const recommendationsContainer = document.getElementById('recommendations-container');
        if (recommendationsContainer) {
            recommendationsContainer.innerHTML = activityRecommendationsTemplate(recommendations);
        }
    }

    setupRegenerateButton() {
        document.addEventListener('click', async (e) => {
            if (e.target.closest('#regenerate-recommendations')) {
                try {

                    const button = e.target.closest('#regenerate-recommendations');
                    const originalText = button.innerHTML;
                    button.innerHTML = `
                    <svg class="animate-spin h-4 w-4 mr-1" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                        <circle class="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" stroke-width="4"></circle>
                        <path class="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                    </svg>
                    Memuat...
                    `;
                    button.disabled = true;

                    const recommendations = await this.presenter.regenerateRecommendations();
                    this.updateRecommendationsSection(recommendations);

                    showToast('Rekomendasi aktivitas baru telah dimuat!');
                } catch (error) {
                    console.error('Failed to regenerate recommendations:', error);
                    showToast(error.message || 'Gagal memuat rekomendasi baru', 'error');
                }
            }
        });
    }


    updateTodayButtonState() {
        const todayBtn = document.getElementById('todayBtn');
        const currentDate = this.presenter.getCurrentDate();
        const today = new Date();

        const isCurrentMonth = currentDate.getMonth() === today.getMonth() &&
            currentDate.getFullYear() === today.getFullYear();

        if (isCurrentMonth) {
            todayBtn.className = "bg-gray-200 text-gray-400 text-sm px-4 py-2 rounded-md";
        } else {
            todayBtn.className = "bg-third text-white text-sm px-4 py-2 rounded-md hover:bg-third/80 transition-colors";
        }
    }

    async handleDayClick(dayElement) {
        document.querySelectorAll('div[data-date]').forEach(el => {
            el.classList.remove('bg-blue-100');
        });
        dayElement.classList.add('bg-blue-100');

        const dateStr = dayElement.getAttribute('data-date');
        try {
            const result = await this.presenter.getEntryByDate(dateStr);
            this.showModal(result.formattedDate, result.data, true);
        } catch (error) {
            console.error('Error fetching mind tracker data:', error);
            showToast(error.message || 'Terjadi kesalahan server', 'error');
        }
    }

    showModal(formattedDate, existingData = null, isViewMode = true) {
        const existingModal = document.getElementById('mindTrackerModal');
        if (existingModal) {
            existingModal.remove();
        }

        const isCalendarView = document.getElementById('calendarDays').contains(document.activeElement);
        const finalViewMode = isCalendarView ? true : isViewMode;

        document.body.insertAdjacentHTML('beforeend', mindTrackerModalTemplate(finalViewMode));


        const modal = document.getElementById('mindTrackerModal');
        const modalTitle = document.getElementById('modalTitle');
        const closeModalBtn = document.getElementById('closeModalBtn');
        const mindTrackerForm = document.getElementById('mindTrackerForm');

        modalTitle.textContent = `Mind Tracker — ${formattedDate}`;
        modal.classList.remove('hidden');
        modal.classList.add('flex');

        if (existingData) {
            document.querySelector('textarea[name="progress"]').value = existingData.progress || '';
        }

        if (finalViewMode) {
            const form = document.getElementById('mindTrackerForm');
            if (form) {
                form.onsubmit = (e) => {
                    e.preventDefault();
                    return false;
                };
            }
        }

        this.setupModalEventListeners(modal, mindTrackerForm, formattedDate);
    }

    setupModalEventListeners(modal, form, formattedDate) {
        const closeModalBtn = document.getElementById('closeModalBtn');

        closeModalBtn.addEventListener('click', () => {
            modal.classList.add('hidden');
            modal.classList.remove('flex');
        });

        modal.addEventListener('click', (e) => {
            if (e.target === modal) {
                modal.classList.add('hidden');
                modal.classList.remove('flex');
            }
        });

        if (form) {
            form.addEventListener('submit', async (e) => {
                e.preventDefault();
                e.stopPropagation();

                const formData = new FormData(form);
                const progressText = formData.get('progress');

                if (!progressText || progressText.trim() === '') {
                    showToast('Silakan isi progress Anda hari ini.', 'error');
                    return false;
                }

                const data = {
                    date: this.presenter.parseDateString(formattedDate).toISOString(),
                    progress: formData.get('progress')
                };

                try {
                    const result = await this.presenter.saveEntry(data);

                    if (!result.error) {
                        modal.classList.add('hidden');
                        modal.classList.remove('flex');
                        form.reset();
                        generateCalendar(this.presenter.getCurrentDate(), this.presenter.getMonthNames());
                        showToast(result.message, 'success');
                    } else {
                        throw new Error(result.message);
                    }
                } catch (error) {
                    console.error('Error saving mind tracker:', error);
                    showToast(error.message || 'Terjadi kesalahan server', 'error');
                }

                return false;
            });
        }
    }
}