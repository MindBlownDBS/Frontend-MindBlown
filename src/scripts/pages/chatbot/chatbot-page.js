import { userChatBubble, botChatBubble } from '../templates';
import { autoResize } from '../../utils';

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
       <section class="ml-0 md:ml-8 lg:ml-16 min-h-screen flex">
        <div class="w-full flex items-center pb-20"> 
            <div class="max-w-2xl w-full mx-auto text-center">
                
                <div id="chat-container" class="flex flex-col gap-2 px-6 lg:px-4 overflow-y-auto max-h-[75vh] md:max-h[80vh] lg:max-h-[75vh]">
                </div>
                
                <form id="chat-form" class="fixed bottom-24 lg:bottom-6 z-50 w-full lg:w-full md:max-w-2xl lg:max-w-2xl mx-auto px-4 lg:px-0 flex gap-2">
                    <textarea 
                      id="chat-input"
                      class="text-[#8c8c8c] w-full h-16 md:h-20 lg:h-24 px-4 py-3 pr-14 rounded-3xl border border-gray-300 focus:outline-none focus:ring-2 focus:ring-teal-500 focus:border-transparent overflow-hidden placeholder:leading-[2rem] md:placeholder:leading-[3rem] lg:placeholder:leading-[4rem]"
                      placeholder="Cerita sedikit..."></textarea>
                    <button class="absolute right-6 lg:right-3 top-1/2 transform -translate-y-1/2 rounded-full bg-[#eee] p-2 flex items-center justify-center hover:bg-third focus:bg-third transition cursor-pointer">
                        <svg xmlns="http://www.w3.org/2000/svg"  class="w-6 h-6 text-white" fill="none" viewBox="-0.5 -0.5 16 16" stroke-linecap="round" stroke-linejoin="round" stroke="white" id="Send--Streamline-Mynaui" height="16" width="16">
                        <path d="m8.75 6.25 -1.875 1.875m5.805 -6.230625a0.33437500000000003 0.33437500000000003 0 0 1 0.42500000000000004 0.42562500000000003l-3.7025 10.58125a0.33437500000000003 0.33437500000000003 0 0 1 -0.62125 0.025l-2.011875 -4.52625a0.33375 0.33375 0 0 0 -0.169375 -0.169375l-4.52625 -2.0125a0.33437500000000003 0.33437500000000003 0 0 1 0.025 -0.620625z" stroke-width="1"></path>
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
        input.addEventListener('input', () => autoResize(input));

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
            input.style.height = '';

          
            setTimeout(async () => {
                const reply = 'Ini balasan dari bot ipsom lorem alemet aku anjay mabar!'; 

                chatContainer.insertAdjacentHTML('beforeend', botChatBubble(reply));
                scrollToBottom();
            }, 1000);
        });
    }
}

