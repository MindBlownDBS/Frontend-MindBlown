export function mindTrackerModalTemplate() {
    return `
    <div id="mindTrackerModal" class="fixed inset-0 items-center justify-center bg-black/40 z-50 hidden">
        <div class="bg-white rounded-lg shadow-lg p-6 w-full max-w-lg">
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
                    <textarea name="progress" class="w-full border p-2 rounded-xl overflow-hidden" rows="3" placeholder="Ceritakan bagaimana harimu dan perasaanmu sekarang" required></textarea>
                </div>
                <div class="flex justify-end">
                    <button type="submit" class="w-25 bg-third text-white py-2 rounded-lg mt-2 justify-end">Kirim</button>
                </div>
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
                    <img src="images/logo.png" alt="Bot" class="w-5 h-5 object-cover">
                </div>
                <div class="bg-white px-3 py-2 rounded-lg text-sm text-gray-800">
                    ${text}
                </div>
            </div>
        </div>
    `;
}
