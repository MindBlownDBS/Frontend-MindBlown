export default class NotFoundPage {
    constructor() {
        this.title = '404 - Halaman Tidak Ditemukan';
    }

    async render() {
        return `
      <section class="min-h-screen flex items-center justify-center bg-gray-50">
        <div class="text-center px-6 py-12 max-w-md mx-auto">
          <div class="mb-8">
            <div class="text-9xl font-bold text-third mb-6">404</div>
          </div>

          <h1 class="text-3xl font-bold text-gray-900 mb-4">
            Halaman Tidak Ditemukan
          </h1>
          
          <p class="text-gray-600 mb-8 leading-relaxed">
            Maaf, halaman yang Anda cari tidak dapat ditemukan.
          </p>

          <div class="space-y-4">
            <button 
              id="go-home" 
              class="w-full bg-third text-white py-3 px-6 rounded-lg font-medium hover:bg-third/90 transition-colors">
              Kembali ke Beranda
            </button>
            
            <button 
              id="go-back" 
              class="w-full border border-gray-300 text-gray-700 py-3 px-6 rounded-lg font-medium hover:bg-gray-50 transition-colors">
              Kembali ke Halaman Sebelumnya
            </button>
          </div>
        </div>
      </section>
    `;
    }

    async afterRender() {
        this.attachEventListeners();
    }

    attachEventListeners() {
        const goHomeBtn = document.getElementById('go-home');
        const goBackBtn = document.getElementById('go-back');

        if (goHomeBtn) {
            goHomeBtn.addEventListener('click', () => {
                window.location.hash = '#/';
            });
        }

        if (goBackBtn) {
            goBackBtn.addEventListener('click', () => {
                if (window.history.length > 1) {
                    window.history.back();
                } else {
                    window.location.hash = '#/';
                }
            });
        }
    }
}
