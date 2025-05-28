export function generateCalendar(date, monthNames) {
    const year = date.getFullYear();
    const month = date.getMonth();

    const monthDisplay = document.getElementById('monthDisplay');
    monthDisplay.textContent = `${monthNames[month]} ${year}`;

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
            <div class="flex items-center justify-center border-t border-r border-gray-100 p-2 h-20 md:h-25 lg:h-30">
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
        const formattedMonth = (month + 1).toString().padStart(2, '0');
        const formattedDay = i.toString().padStart(2, '0');
        days += `
            <div class="flex items-center justify-center border-t border-r border-gray-100 p-2 h-20 md:h-25 lg:h-30 ${todayClass}" data-date="${year}-${formattedMonth}-${formattedDay}">
                <span class="text-sm ${isToday ? 'text-blue-600' : 'text-gray-700'}">${i}</span>
            </div>`;
    }

    const remainingDays = 35 - (firstDayIndex + lastDate);
    for (let j = 1; j <= remainingDays; j++) {
        days += `
            <div class="flex items-center justify-center border-t border-r border-gray-100 p-2 h-20 md:h-25 lg:h-30">
                <span class="text-sm text-gray-400">${j}</span>
            </div>`;
    }

    calendarDays.innerHTML = days;
}