import { autoResize } from "../../utils";
import { welcomeModalTemplate,userChatBubble, botTypingBubble } from "../templates";
import { getAccessToken } from "../../utils/auth";

export default class HomePage {
  constructor() {
    this.isProcessing = false; 
  }

  async render() {
    return `
      <section class="md:ml-16 h-150 md:h-screen lg:min-h-screen flex items-center">
        <div class="w-full flex items-center pb-20"> 
            <div class="max-w-2xl w-full mx-auto text-center">
                <img src="images/logo.png" alt="Logo" class="w-27 h-27 mx-auto mb-3 lg:mb-10 mt-30">
                <h1 class="text-primary lg:text-3xl text-2xl font-semibold mb-1">Hai, aku MindBlown!</h1>
                <p class="text-secondary mb-8 lg:text-lg text-sm px-10 lg:px-0">Apa pun yang kamu rasain sekarang, itu valid. Mau cerita sedikit?</p>

                <div id="chat-container" class="flex flex-col gap-2 px-4"></div>
                
                <form id="chat-form" class="relative mx-4 lg:mx-0 flex flex-col gap-2">
                    <textarea 
                      id="chat-input"
                      class="text-[#8c8c8c] w-full h-16 lg:h-24 px-4 py-3 pr-14 rounded-3xl border border-gray-300 focus:outline-none focus:ring-2 focus:ring-teal-500 focus:border-transparent overflow-hidden   placeholder:leading-[2rem] lg:placeholder:leading-[4rem]"
                      placeholder="Cerita sedikit..."></textarea>
                    <button class="absolute right-3 top-1/2 transform -translate-y-1/2 rounded-full bg-[#eee] p-2 flex items-center justify-center hover:bg-third focus:bg-third transition cursor-pointer">
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

    if (!getAccessToken() && !sessionStorage.getItem('welcomeModalShown')) {
      this.#showWelcomeModal();
    }

    const input = document.getElementById('chat-input');
    const form = document.getElementById('chat-form');
    const chatContainer = document.getElementById('chat-container');

    input.addEventListener('input', () => autoResize(input));

    const pendingMessage = localStorage.getItem('pendingChatMessage');
    if (pendingMessage) {
      localStorage.removeItem('pendingChatMessage');
    }

    this.#setupForm(chatContainer, input, form);
  }

  #setupForm(chatContainer, input, form) {
    const scrollToBottom = () => {
      requestAnimationFrame(() => {
        chatContainer.scrollTop = chatContainer.scrollHeight;
      });
    };
    
    form.addEventListener('submit', (e) => {
      e.preventDefault();
      
      if (this.isProcessing) return;
      
      const text = input.value.trim();
      if (!text) return;
      
      this.isProcessing = true;
      input.disabled = true;
      
      const sendButton = form.querySelector('button');
      if (sendButton) {
        sendButton.disabled = true;
      }

      chatContainer.insertAdjacentHTML('beforeend', userChatBubble(text));
      scrollToBottom();
      
      input.value = '';
      input.style.height = '';
      
      chatContainer.insertAdjacentHTML('beforeend', botTypingBubble('Mengarahkan ke chatbot...'));
      scrollToBottom();
      
      localStorage.setItem('pendingChatMessage', text);
      localStorage.setItem('hasInteractedWithChatbot', 'true');

      
      window.location.hash = '/chatbot';
    });
  }
      

  #showWelcomeModal() {
    if (document.getElementById('welcome-modal')) return;

    const modalWrapper = document.createElement('div');
    modalWrapper.id = 'welcome-modal';
    modalWrapper.innerHTML = welcomeModalTemplate();
    document.body.appendChild(modalWrapper);

    sessionStorage.setItem('welcomeModalShown', 'true');

    document.getElementById('welcome-login').onclick = () => {
      modalWrapper.remove();
      window.location.hash = '/login';
    };
    document.getElementById('welcome-signup').onclick = () => {
      modalWrapper.remove();
      window.location.hash = '/register';
    };
    document.getElementById('welcome-stay-logged-out').onclick = (e) => {
      e.preventDefault();
      modalWrapper.remove();
    };
  }
}