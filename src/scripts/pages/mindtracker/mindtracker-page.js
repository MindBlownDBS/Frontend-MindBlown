import { mindTrackerModalTemplate, activityRecommendationsTemplate, showToast } from '../templates';
import { generateCalendar } from '../../utils/generate-calendar';
import { weeklyMoodTrackerGridTemplate } from '../templates';
import MindTrackerPresenter from './mindtracker-presenter';

export default class MindTrackerPage {
    constructor() {
        this.presenter = new MindTrackerPresenter();
    }

    async render() {
        return `
        <div class="md:ml-16 lg:ml-16 min-h-screen p-6 lg:p-10 pb-20 lg:pb-10">
        <div class="max-w-md md:max-w-[90%] ml-0 mx-auto">
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

           <div class="mt-8 mb-6">
                <h2 class="font-semibold text-base mb-4">Mood Tracker Minggu Ini</h2>
                <div class="weekly-tracker-container">
                    <!-- Loading indicator -->
                    <div class="bg-white rounded-xl border border-gray-200 p-4 flex justify-center items-center h-32">
                        <div class="animate-spin rounded-full h-8 w-8 border-b-2 border-third"></div>
                    </div>
                </div>
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
                    <div class="text-xs text-gray-500 text-center py-2 border-t border-r border-gray-100">Min</div>
                    <div class="text-xs text-gray-500 text-center py-2 border-t border-r border-gray-100">Sen</div>
                    <div class="text-xs text-gray-500 text-center py-2 border-t border-r border-gray-100">Sel</div>
                    <div class="text-xs text-gray-500 text-center py-2 border-t border-r border-gray-100">Rab</div>
                    <div class="text-xs text-gray-500 text-center py-2 border-t border-r border-gray-100">Kam</div>
                    <div class="text-xs text-gray-500 text-center py-2 border-t border-r border-gray-100">Jum</div>
                    <div class="text-xs text-gray-500 text-center py-2 border-t border-r border-gray-100">Sab</div>

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

            await this.loadAndRenderWeeklyEntries();
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


    async loadAndRenderWeeklyEntries() {
        try {
            const weeklyData = await this.presenter.loadWeeklyEntries();
            const weeklyContainer = document.querySelector('.weekly-tracker-container');

            if (weeklyContainer) {

                weeklyContainer.innerHTML = weeklyMoodTrackerGridTemplate(weeklyData);

                const moodPoints = weeklyContainer.querySelectorAll('[data-date][data-mood]');
                moodPoints.forEach(point => {
                    if (point.classList.contains('cursor-pointer')) {
                        point.addEventListener('click', () => {
                            const date = point.dataset.date;
                            const mood = point.dataset.mood;
                            const progress = point.dataset.progress;


                            this.showModal(date.split('T')[0], {
                                mood: mood,
                                progress: progress
                            }, true);
                        });
                    }
                });


                this.setupMobileCarousel();


                const prevButton = weeklyContainer.querySelector('#moodPrevBtn');
                const nextButton = weeklyContainer.querySelector('#moodNextBtn');

                if (prevButton) {
                    prevButton.addEventListener('click', async (event) => {

                        const carousel = document.querySelector('.mood-mobile-carousel');
                        if (carousel && window.innerWidth < 1024) {
                            event.preventDefault();
                            this.mobileCarouselPrev();
                        } else {
                            await this.presenter.loadPreviousWeekEntries();
                            this.loadAndRenderWeeklyEntries();
                        }
                    });
                }

                if (nextButton) {
                    nextButton.addEventListener('click', async (event) => {

                        const carousel = document.querySelector('.mood-mobile-carousel');
                        if (carousel && window.innerWidth < 1024) {
                            event.preventDefault();
                            this.mobileCarouselNext();
                        } else {
                            await this.presenter.loadNextWeekEntries();
                            this.loadAndRenderWeeklyEntries();
                        }
                    });
                }
            }
        } catch (error) {
            console.error('Failed to load weekly entries:', error);
            const weeklyContainer = document.querySelector('.weekly-tracker-container');
            if (weeklyContainer) {
                weeklyContainer.innerHTML = `
                <div class="bg-white rounded-xl border border-gray-200 p-4 text-center text-red-500">
                    <p>Gagal memuat data mood tracker mingguan.</p>
                </div>
            `;
            }
        }
    }

    setupMobileCarousel() {
        const carousel = document.querySelector('.mood-mobile-carousel');
        if (!carousel) return;

        const slides = carousel.querySelector('.mood-mobile-carousel-slides');
        const dots = carousel.querySelectorAll('.mobile-carousel-dot');


        this.mobileCarouselState = {
            slides,
            dots,
            currentSlide: 0,
            visibleDays: 3,
            totalSlides: Math.ceil(this.presenter.getWeeklyEntries().length / 3)
        };

        dots.forEach((dot, i) => {
            dot.addEventListener('click', () => this.goToMobileSlide(i));
        });


        this.goToMobileSlide(0);


        let touchStartX = 0;
        let touchEndX = 0;

        carousel.addEventListener('touchstart', (e) => {
            touchStartX = e.changedTouches[0].screenX;
        }, { passive: true });

        carousel.addEventListener('touchend', (e) => {
            touchEndX = e.changedTouches[0].screenX;
            handleSwipe();
        }, { passive: true });

        const handleSwipe = () => {
            const swipeThreshold = 50;
            if (touchEndX < touchStartX - swipeThreshold) {

                this.mobileCarouselNext();
            }
            if (touchEndX > touchStartX + swipeThreshold) {

                this.mobileCarouselPrev();
            }
        };
    }

    goToMobileSlide(index) {
        const state = this.mobileCarouselState;
        if (!state) return;

        if (index >= state.totalSlides) index = 0;
        if (index < 0) index = state.totalSlides - 1;

        state.currentSlide = index;


        const slideWidth = 80;
        const slideOffset = index * (state.visibleDays * slideWidth);


        state.slides.style.transform = `translateX(-${slideOffset}px)`;


        state.dots.forEach((dot, i) => {
            if (i === state.currentSlide) {
                dot.classList.add('bg-third');
                dot.classList.remove('bg-gray-300');
            } else {
                dot.classList.remove('bg-third');
                dot.classList.add('bg-gray-300');
            }
        });


        const prevButton = document.querySelector('#moodPrevBtn');
        const nextButton = document.querySelector('#moodNextBtn');

        if (window.innerWidth < 1024) {
            if (prevButton) {
                prevButton.disabled = state.currentSlide === 0;
                if (state.currentSlide === 0) {
                    prevButton.classList.add('opacity-50');
                } else {
                    prevButton.classList.remove('opacity-50');
                }
            }

            if (nextButton) {
                nextButton.disabled = state.currentSlide === state.totalSlides - 1;
                if (state.currentSlide === state.totalSlides - 1) {
                    nextButton.classList.add('opacity-50');
                } else {
                    nextButton.classList.remove('opacity-50');
                }
            }
        }
    }

    mobileCarouselPrev() {
        const state = this.mobileCarouselState;
        if (!state || state.currentSlide <= 0) return;
        this.goToMobileSlide(state.currentSlide - 1);
    }

    mobileCarouselNext() {
        const state = this.mobileCarouselState;
        if (!state || state.currentSlide >= state.totalSlides - 1) return;
        this.goToMobileSlide(state.currentSlide + 1);
    }


    renderWeeklyEntries(container, { weekRange, entries }) {
        if (!entries || entries.length === 0) {
            container.innerHTML = `
            <div class="text-center py-4 text-gray-500">
                <p>Belum ada data mood tracker untuk minggu ini.</p>
            </div>
        `;
            return;
        }

        const startDate = new Date(weekRange.start);
        const endDate = new Date(weekRange.end);

        const formattedDateRange = `${startDate.toLocaleDateString('id-ID', { day: 'numeric', month: 'short' })} - ${endDate.toLocaleDateString('id-ID', { day: 'numeric', month: 'short', year: 'numeric' })}`;

        let html = `
        <div class="mb-3">
            <h3 class="text-sm font-medium text-gray-500">Minggu Ini (${formattedDateRange})</h3>
        </div>
        <div class="grid grid-cols-7 gap-2">
    `;

        entries.forEach(entry => {
            const date = new Date(entry.date);
            const dayNumber = date.getDate();
            const moodEmoji = entry.hasEntry ? this.presenter.getMoodEmoji(entry.mood) : '—';
            const bgColor = entry.hasEntry ? 'bg-third/10' : 'bg-gray-100';
            const textColor = entry.hasEntry ? 'text-gray-800' : 'text-gray-400';

            html += `
            <div class="${bgColor} rounded-lg p-2 text-center ${textColor}">
                <div class="text-xs font-medium">${entry.dayName.slice(0, 3)}</div>
                <div class="text-lg font-bold">${dayNumber}</div>
                <div class="text-xl my-1">${moodEmoji}</div>
            </div>
        `;
        });

        html += `</div>`;

        if (entries.some(entry => entry.hasEntry)) {
            html += `
            <div class="mt-3 text-xs text-gray-500 text-right">
                <span>Tap tanggal untuk melihat detail</span>
            </div>
        `;
        }

        container.innerHTML = html;
        const moodCells = container.querySelectorAll('.grid > div');
        entries.forEach((entry, index) => {
            if (entry.hasEntry) {
                moodCells[index].classList.add('cursor-pointer', 'hover:bg-third/20');
                moodCells[index].addEventListener('click', () => {
                    this.showModal(entry.date.split('T')[0], {
                        progress: entry.progress,
                        mood: entry.mood
                    }, true);
                });
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

        const selectedMood = existingData?.mood || '';

        document.body.insertAdjacentHTML('beforeend', mindTrackerModalTemplate(finalViewMode, selectedMood));

        const modal = document.getElementById('mindTrackerModal');
        const modalTitle = document.getElementById('modalTitle');
        const closeModalBtn = document.getElementById('closeModalBtn');
        const mindTrackerForm = document.getElementById('mindTrackerForm');

        let displayDate = formattedDate;
        if (formattedDate.match(/^\d{4}-\d{2}-\d{2}$/)) {
            const dateParts = formattedDate.split('-');
            const dateObj = new Date(dateParts[0], dateParts[1] - 1, dateParts[2]);
            displayDate = dateObj.toLocaleDateString('id-ID', {
                day: 'numeric',
                month: 'long',
                year: 'numeric'
            });
        }

        modalTitle.textContent = `Mind Tracker — ${displayDate}`;
        modal.classList.remove('hidden');
        modal.classList.add('flex');

        if (existingData) {
            document.querySelector('textarea[name="progress"]').value = existingData.progress || '';

            const moodInput = document.getElementById('selected-mood');
            if (moodInput && existingData.mood) {
                moodInput.value = existingData.mood;
            }
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
        const moodOptions = document.querySelectorAll('.mood-option');
        const moodInput = document.getElementById('selected-mood');

        if (!form.querySelector('textarea[name="progress"]').readOnly) {
            moodOptions.forEach(option => {
                option.addEventListener('click', () => {

                    moodOptions.forEach(m => {
                        m.querySelector('span').classList.remove('scale-125');
                    });

                    const moodValue = option.dataset.mood;
                    option.querySelector('span').classList.add('scale-125');
                    moodInput.value = moodValue;
                });
            });
        }

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

                const submitButton = document.querySelector('#submit-mind-tracker button');
                const originalButtonText = submitButton.innerHTML;

                submitButton.disabled = true;
                submitButton.innerHTML = `Memproses...`;

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
                        await this.loadAndRenderWeeklyEntries();
                        showToast(result.message, 'success');
                    } else {
                        throw new Error(result.message);
                    }
                } catch (error) {
                    console.error('Error saving mind tracker:', error);
                    showToast(error.message || 'Terjadi kesalahan server', 'error');

                    submitButton.disabled = false;
                    submitButton.innerHTML = originalButtonText;
                }

                return false;
            });
        }
    }
}