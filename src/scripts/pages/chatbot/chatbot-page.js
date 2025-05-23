import { userChatBubble, botChatBubble } from '../templates';

export default class ChatbotPage {
    constructor() {
        this.sessionId = localStorage.getItem('sessionId') || this.#generateSessionId();
        localStorage.setItem('sessionId', this.sessionId);
    }

    #generateSessionId() {
        return Date.now().toString(36) + Math.random().toString(36).substr(2, 9);
    }

    async render() {
        return `
       <section class="ml-16 min-h-screen flex">
        <div class="w-full flex items-center pb-20"> 
            <div class="max-w-2xl w-full mx-auto text-center">
                
                <div id="chat-container" class="flex flex-col gap-2 px-4 overflow-y-auto  max-h-[60vh]">
                </div>
                
                <form id="chat-form" class="fixed bottom-6 bg-white z-50 w-full max-w-2xl mx-auto">
                    <textarea 
                      id="chat-input"
                      class="text-[#8c8c8c] w-full h-24 px-4 py-3 pr-14 rounded-3xl border border-gray-300 focus:outline-none focus:ring-2 focus:ring-teal-500 focus:border-transparent overflow-hidden"
                      placeholder="Cerita sedikit..."></textarea>
                    <button class="absolute right-3 top-1/2 transform -translate-y-1/2 rounded-full bg-[#eee] p-2">
                        <svg class="w-6 h-6 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M14 5l7 7m0 0l-7 7m7-7H3"></path>
                        </svg>
                    </button>
                </form>
            </div>
        </div>
      </section>
        `;
    }

    async afterRender() {
        const chatContainer = document.getElementById('chat-container');
        const form = document.getElementById('chat-form');
        const input = document.getElementById('chat-input');

        function scrollToBottom() {
            requestAnimationFrame(() => {
                chatContainer.scrollTop = chatContainer.scrollHeight;
            });
        }

        const pendingMsg = localStorage.getItem('pendingChatMessage');
        if (pendingMsg) {
            chatContainer.insertAdjacentHTML('beforeend', userChatBubble(pendingMsg));
            localStorage.removeItem('pendingChatMessage');
            scrollToBottom();
            
            setTimeout(() => {
                const reply = 'Hai, terima kasih sudah cerita! Aku di sini untuk mendengarkan.';
                chatContainer.insertAdjacentHTML('beforeend', botChatBubble(reply));
                scrollToBottom();
            }, 500);
        }

        form.addEventListener('submit', async (e) => {
            e.preventDefault();
            const text = input.value.trim();
            if (!text) return;

            chatContainer.insertAdjacentHTML('beforeend', userChatBubble(text));
            scrollToBottom();
            input.value = '';

            // Dapatkan balasan bot (dummy, atau fetch dari backend)
            setTimeout(async () => {
                const reply = 'Ini balasan dari bot!'; 

                chatContainer.insertAdjacentHTML('beforeend', botChatBubble(reply));
                scrollToBottom();
            }, 1000);
        });
    }
}

