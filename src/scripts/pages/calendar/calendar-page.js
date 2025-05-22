import { mindTrackerModalTemplate } from '../templates';
import { generateCalendar } from '../../utils/generate-calendar';

export default class CalendarPage {

    constructor() {
        this.currentDate = new Date();
        this.monthNames = [
            'January', 'February', 'March', 'April', 'May', 'June',
            'July', 'August', 'September', 'October', 'November', 'December'
        ];
    }

    async render() {
        return `
         <div class="ml-3 p-8">
        <div class="max-w-6xl mx-auto">
            <div class="mb-4">
                <h1 class="text-2xl font-semibold text-gray-900 mb-2">Mind Tracker</h1>
                <p class="text-gray-600">Hari ini rasanya gimana? Ini tracker ini buat bantu kamu lebih sadar sama perasaan dan progressmu.</p>
                <hr class="mt-4 text-gray-300">
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
        generateCalendar(this.currentDate, this.monthNames);

        document.getElementById('prevMonth').addEventListener('click', () => {
            this.currentDate.setMonth(this.currentDate.getMonth() - 1);
            generateCalendar(this.currentDate, this.monthNames);
        });

        document.getElementById('nextMonth').addEventListener('click', () => {
            this.currentDate.setMonth(this.currentDate.getMonth() + 1);
            generateCalendar(this.currentDate, this.monthNames);
        });

        document.getElementById('todayBtn').addEventListener('click', () => {
            this.currentDate = new Date();
            generateCalendar(this.currentDate, this.monthNames);
        });

        document.getElementById('calendarDays').addEventListener('click', (e) => {
            const dayElement = e.target.closest('div[data-date]');
            if (dayElement) {
                document.querySelectorAll('div[data-date]').forEach(el => {
                    el.classList.remove('bg-blue-100');
                });
                dayElement.classList.add('bg-blue-100');
            }
        });

        if (!document.getElementById('mindTrackerModal')) {
            document.body.insertAdjacentHTML('beforeend', mindTrackerModalTemplate());
        }

        const modal = document.getElementById('mindTrackerModal');
        const closeModalBtn = document.getElementById('closeModalBtn');
        const modalTitle = document.getElementById('modalTitle');
        const mindTrackerForm = document.getElementById('mindTrackerForm');

        document.getElementById('calendarDays').addEventListener('click', (e) => {
            const dayElement = e.target.closest('div[data-date]');
            if (dayElement) {
                document.querySelectorAll('div[data-date]').forEach(el => {
                    el.classList.remove('bg-blue-100');
                });
                dayElement.classList.add('bg-blue-100');

                modal.classList.remove('hidden');
                modal.classList.add('flex');
                const dateStr = dayElement.getAttribute('data-date');
                const dateObj = new Date(dateStr);
                const formattedDate = dateObj.toLocaleDateString('id-ID', {
                    day: 'numeric',
                    month: 'long',
                    year: 'numeric'
                });
                modalTitle.textContent = `Mind Tracker — Hari ini, ${formattedDate}`;
            }
        });

        if (mindTrackerForm) {
            mindTrackerForm.addEventListener('submit', async (e) => {
                e.preventDefault();
                const formData = new FormData(mindTrackerForm);
                const dateStr = modalTitle.textContent.split('—')[1].trim();
                
                const [_, day, month, year] = dateStr.match(/(\d+)\s+(\w+)\s+(\d+)/);
                const monthMap = {
                    'Januari': 0, 'Februari': 1, 'Maret': 2, 'April': 3,
                    'Mei': 4, 'Juni': 5, 'Juli': 6, 'Agustus': 7,
                    'September': 8, 'Oktober': 9, 'November': 10, 'Desember': 11
                };

                const data = {
                    date: new Date(year, monthMap[month], day).toISOString(),
                    mood: formData.get('mood'),
                    progress: formData.get('progress')
                };

                try {
                    const accessToken = localStorage.getItem('accessToken');
                    
                    if (!accessToken) {
                        throw new Error('Anda belum login. Silakan login terlebih dahulu.');
                    }
                    const response = await fetch('http://localhost:5000/mindTracker', {
                        method: 'POST',
                        headers: {
                            'Content-Type': 'application/json',
                            'Authorization': `Bearer ${accessToken}`
                        },
                        body: JSON.stringify(data)
                    });

                    const result = await response.json();

                    if (!result.error) {
                        modal.classList.add('hidden');
                        modal.classList.remove('flex');
                        mindTrackerForm.reset();
                        alert(result.message);
                    } else {
                        throw new Error(result.message);
                    }
                } catch (error) {
                    console.error('Error saving mind tracker:', error);
                    alert(error.message || 'Terjadi kesalahan server');
                }
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
    }


}
