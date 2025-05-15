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

    generateCalendar(date) {
        const year = date.getFullYear();
        const month = date.getMonth();
        
        const monthDisplay = document.getElementById('monthDisplay');
        monthDisplay.textContent = `${this.monthNames[month]} ${year}`;
        
        const firstDay = new Date(year, month, 1);
        const lastDay = new Date(year, month + 1, 0);
        
        const firstDayIndex = firstDay.getDay();
        const lastDate = lastDay.getDate();
        const prevLastDay = new Date(year, month, 0);
        const prevLastDate = prevLastDay.getDate();
        
        const calendarDays = document.getElementById('calendarDays');
        let days = '';

        for (let x = firstDayIndex; x > 0; x--) {
            days += `
                <div class="flex items-center justify-center border-t border-r border-gray-100 p-2 h-30">
                    <span class="text-sm text-gray-400">${prevLastDate - x + 1}</span>
                </div>`;
        }
        
        for (let i = 1; i <= lastDate; i++) {
            const isToday = i === new Date().getDate() && 
                           month === new Date().getMonth() && 
                           year === new Date().getFullYear();
            
            const todayClass = isToday 
                ? 'bg-blue-50 text-blue-600 font-semibold' 
                : 'hover:bg-gray-50';
            
            days += `
                <div class="flex items-center justify-center border-t border-r border-gray-100 p-2 h-30 ${todayClass}" data-date="${year}-${month + 1}-${i}">
                    <span class="text-sm ${isToday ? 'text-blue-600' : 'text-gray-700'}">${i}</span>
                </div>`;
        }

        const remainingDays = 35 - (firstDayIndex + lastDate);
        for (let j = 1; j <= remainingDays; j++) {
            days += `
                <div class="flex items-center justify-center border-t border-r border-gray-100 p-2 h-30">
                    <span class="text-sm text-gray-400">${j}</span>
                </div>`;
        }

        calendarDays.innerHTML = days;
    }

    async afterRender() {
        this.generateCalendar(this.currentDate);

        document.getElementById('prevMonth').addEventListener('click', () => {
            this.currentDate.setMonth(this.currentDate.getMonth() - 1);
            this.generateCalendar(this.currentDate);
        });

        document.getElementById('nextMonth').addEventListener('click', () => {
            this.currentDate.setMonth(this.currentDate.getMonth() + 1);
            this.generateCalendar(this.currentDate);
        });

        document.getElementById('todayBtn').addEventListener('click', () => {
            this.currentDate = new Date();
            this.generateCalendar(this.currentDate);
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
    }
}
