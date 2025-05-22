export default class HomePage {
  async render() {
    return `
      <section class="ml-16 min-h-screen flex">
        <div class="w-full flex items-center pb-20"> 
            <div class="max-w-2xl w-full mx-auto text-center">
                <img src="images/logo.png" alt="Logo" class="w-22 h-22 mx-auto mb-10 mt-30">
                <h1 class="text-primary text-3xl font-semibold mb-1">Hai, aku MindBlown!</h1>
                <p class="text-secondary mb-8">Apa pun yang kamu rasain sekarang, itu valid. Mau cerita sedikit?</p>
                
                <div class="relative">
                    <textarea 
                           class="text-[#8c8c8c] w-full h-24 px-4 py-3 pr-14 rounded-3xl border border-gray-300 focus:outline-none focus:ring-2 focus:ring-teal-500 focus:border-transparent overflow-hidden"
                           placeholder="Cerita sedikit..."></textarea>
                    <button class="absolute right-3 top-1/2 transform -translate-y-1/2 rounded-full bg-[#eee] p-2">
                        <svg class="w-6 h-6 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M14 5l7 7m0 0l-7 7m7-7H3"></path>
                        </svg>
                    </button>
                </div>
            </div>
        </div>
      </section>
    `;
  }

  async afterRender() {
  }
}
