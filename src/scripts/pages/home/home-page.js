import { autoResize } from "../../utils";
import { welcomeModalTemplate } from "../templates";
import { getAccessToken } from "../../utils/auth";

export default class HomePage {
  async render() {
    return `
      <section class="md:ml-16 h-150 lg:min-h-screen flex items-center">
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

    if (!getAccessToken() && !sessionStorage.getItem('welcomeModalShown')) {
      this.#showWelcomeModal();
    }

    const input = document.getElementById('chat-input');
    input.addEventListener('input', () => autoResize(input));
    this.#setupForm();
  }

  #setupForm() {
    document.getElementById('chat-form').addEventListener('submit', function (e) {
      e.preventDefault();
      const input = document.getElementById('chat-input');
      const text = input.value.trim();
      if (!text) return;

      localStorage.setItem('pendingChatMessage', text);

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