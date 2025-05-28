export function mindTrackerModalTemplate(isViewMode = true) {
    return `
    <div id="mindTrackerModal" class="fixed inset-0 items-center justify-center bg-black/40 z-50 hidden">
        <div class="bg-white rounded-lg shadow-lg p-6 md:w-lg lg:w-full lg:max-w-lg">
            <div class="flex justify-between items-center mb-4">
                <h3 id="modalTitle" class="text-lg font-semibold">Mind Tracker</h3>
                <button id="closeModalBtn" class="text-gray-400 hover:text-gray-600 text-3xl">&times;</button>
            </div>
            <hr class="my-4 text-gray-300">
            <form id="mindTrackerForm">
                <div class="text-center mb-4">
                    <p class="text-sm my-4">Perasaanmu Hari ini</p>
                    <div class="flex justify-center space-x-6 mb-2 gap-15">
                        <label class="flex flex-col gap-3 cursor-pointer">
                            <input type="radio" name="mood" value="buruk" class="hidden peer" required>
                            <span class="text-3xl peer-checked:scale-125 transition">😞</span>
                            <div class="text-xs">Buruk</div>
                        </label>
                        <label class="flex flex-col gap-3 cursor-pointer">
                            <input type="radio" name="mood" value="oke" class="hidden peer" required>
                            <span class="text-3xl peer-checked:scale-125 transition">🙂</span>
                            <div class="text-xs">Oke</div>
                        </label>
                        <label class="flex flex-col gap-3 cursor-pointer">
                            <input type="radio" name="mood" value="sempurna" class="hidden peer" required>
                            <span class="text-3xl peer-checked:scale-125 transition">🥳</span>
                            <div class="text-xs">Sempurna</div>
                        </label>
                    </div>
                    <p class="mb-4 mt-8">Progres kamu</p>
                    <textarea name="progress" class="w-full border p-2 rounded-xl overflow-hidden" rows="3" placeholder="Ceritakan bagaimana harimu dan perasaanmu sekarang" required ${isViewMode ? 'readonly' : ''}></textarea>
                </div>
                ${!isViewMode ? `
                <div id="submit-mind-tracker" class="flex justify-end">
                    <button type="submit" class="w-25 bg-third text-white py-2 rounded-lg mt-2 justify-end">Kirim</button>
                </div>
                ` : ''}
            </form>
        </div>
    </div>
    `;
}

export function userChatBubble(text) {
    return `
        <div class="flex justify-end mb-3">
            <div class="flex flex-row-reverse items-start gap-2 max-w-[80%]">
                <div class="bg-[#7de3e1] px-4 py-2 rounded-lg text-sm text-gray-800 text-left">
                    ${text}
                </div>
            </div>
        </div>
    `;
}

export function botChatBubble(text) {
    return `
        <div class="flex justify-start mb-3">
            <div class="flex items-start max-w-[80%]">
                <div class="w-6 h-6 rounded-lg bg-white flex items-center justify-center">
                    <img src="images/logo.png" alt="Bot" class="w-8 h-8 object-cover">
                </div>
                <div class="bg-white px-3 py-2 rounded-lg text-sm text-gray-800">
                    ${text}
                </div>
            </div>
        </div>
    `;
}

export function notificationItemTemplate({ icon = 'images/logo.png', title = '', message = '' }) {
    return `
        <div class="flex items-start gap-3 py-4 border-b border-gray-200">
            <div class="w-8 h-8 flex-shrink-0 flex items-center justify-center">
                <img src="${icon}" alt="icon" class="w-7 h-7 object-cover">
            </div>
            <div class="text-left">
                <div class="font-semibold text-base text-gray-800 mb-1">${title}</div>
                <div class="text-sm text-gray-700 leading-snug">${message}</div>
            </div>
        </div>
    `;
}

export function weeklyMoodTrackerTemplate(moods) {
    const desktopPointGap = 200;
    const mobilePointGap = 65;
    const emojiY = [40, 10, 60, 35, 50, 25, 45, 0];
    
    const desktopWidth = (moods.length - 1) * desktopPointGap + 40;
    const mobileWidth = (Math.min(4, moods.length) - 1) * mobilePointGap + 40;
    const height = 80;

    const desktopPoints = moods.map((_, i) => {
        const x = 20 + i * desktopPointGap;
        const y = emojiY[i] || 40;
        return `${x},${y}`;
    }).join(' ');

    const mobilePoints = moods.slice(0, 4).map((_, i) => {
        const x = 20 + i * mobilePointGap;
        const y = emojiY[i] || 40;
        return `${x},${y}`;
    }).join(' ');

    return `
      <div class="bg-white rounded-xl border border-gray-200 p-4 mt-6 mb-8">
        <div class="flex items-center justify-between">
          <button class="rounded-full border border-gray-300 w-8 h-8 flex items-center justify-center text-gray-500 hover:bg-gray-100" id="moodPrevBtn">
            &larr;
          </button>
          <div class="flex-1 flex flex-col items-center">
            <!-- Desktop View -->
            <div class="hidden lg:block" style="position:relative; width:${desktopWidth}px; height:${height + 40}px;">
              <svg width="${desktopWidth}" height="${height}" style="position:absolute;top:0;left:0;">
                <polyline
                  fill="none"
                  stroke="#bbb"
                  stroke-width="2"
                  points="${desktopPoints}"
                />
              </svg>
              ${moods.map((mood, i) => {
                const x = 20 + i * desktopPointGap;
                const y = emojiY[i] || 40;
                return `
                  <div style="position:absolute;left:${x - 18}px;top:${y - 18}px;width:36px;height:36px;display:flex;flex-direction:column;align-items:center;">
                    <span style="font-size:2rem;line-height:1;">${mood.emoji}</span>
                  </div>
                  <div style="position:absolute;left:${x - 30}px;top:${height + 5}px;width:60px;text-align:center;font-size:12px;color:#666;">
                    ${mood.date}
                  </div>
                `;
              }).join('')}
            </div>

            <!-- Mobile View -->
            <div class="lg:hidden" style="position:relative; width:${mobileWidth}px; height:${height + 40}px;">
              <svg width="${mobileWidth}" height="${height}" style="position:absolute;top:0;left:0;">
                <polyline
                  fill="none"
                  stroke="#bbb"
                  stroke-width="2"
                  points="${mobilePoints}"
                />
              </svg>
              ${moods.slice(0, 4).map((mood, i) => {
                const x = 20 + i * mobilePointGap;
                const y = emojiY[i] || 40;
                return `
                  <div style="position:absolute;left:${x - 18}px;top:${y - 18}px;width:36px;height:36px;display:flex;flex-direction:column;align-items:center;">
                    <span style="font-size:1.5rem;line-height:1;">${mood.emoji}</span>
                  </div>
                  <div style="position:absolute;left:${x - 30}px;top:${height + 5}px;width:60px;text-align:center;font-size:12px;color:#666;">
                    ${mood.date}
                  </div>
                `;
              }).join('')}
            </div>
          </div>
          <button class="rounded-full border border-gray-300 w-8 h-8 flex items-center justify-center text-gray-500 hover:bg-gray-100" id="moodNextBtn">
            &rarr;
          </button>
        </div>
      </div>
    `;
}

export function notificationListTemplate(notifications) {
    return `
        <div class="max-w-xl w-full ml-0 md:ml-16 lg:ml-24 text-left">
            <h1 class="text-2xl font-semibold mb-8 mt-3">Pemberitahuan</h1>
            <div>
                ${notifications.map(notificationItemTemplate).join('')}
            </div>
        </div>
    `;
}