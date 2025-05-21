export default class RegisterPage {
  async render() {
    return `
      <section class="ml-16 min-h-screen flex">
        <div class="w-full flex items-center justify-center"> 
            <div class="max-w-md w-full mx-auto bg-white p-8 rounded-lg shadow-md">
                <h1 class="text-primary text-3xl font-bold mb-6 text-center">Daftar</h1>
                
                <form id="registerForm" class="space-y-4">
                    <div id="errorMessage" class="hidden text-red-500 text-center text-sm"></div>
                    <div>
                        <input 
                            type="text" 
                            id="username"
                            placeholder="Username"
                            class="w-full px-4 py-2 rounded-lg border border-gray-300 focus:outline-none focus:ring-2 focus:ring-teal-500 focus:border-transparent"
                            required
                        />
                    </div>
                    <div>
                        <input 
                            type="text" 
                            id="name"
                            placeholder="Nama Lengkap"
                            class="w-full px-4 py-2 rounded-lg border border-gray-300 focus:outline-none focus:ring-2 focus:ring-teal-500 focus:border-transparent"
                            required
                        />
                    </div>
                    <div>
                        <input 
                            type="email" 
                            id="email"
                            placeholder="Email"
                            class="w-full px-4 py-2 rounded-lg border border-gray-300 focus:outline-none focus:ring-2 focus:ring-teal-500 focus:border-transparent"
                            required
                        />
                    </div>
                    <div>
                        <input 
                            type="password" 
                            id="password"
                            placeholder="Password"
                            class="w-full px-4 py-2 rounded-lg border border-gray-300 focus:outline-none focus:ring-2 focus:ring-teal-500 focus:border-transparent"
                            required
                        />
                    </div>
                    <div>
                        <input 
                            type="password" 
                            id="confirmPassword"
                            placeholder="Konfirmasi Password"
                            class="w-full px-4 py-2 rounded-lg border border-gray-300 focus:outline-none focus:ring-2 focus:ring-teal-500 focus:border-transparent"
                            required
                        />
                    </div>
                    <button 
                        type="submit"
                        class="w-full bg-teal-500 text-white py-2 rounded-lg hover:bg-teal-600 transition-colors"
                    >
                        Daftar
                    </button>
                </form>
                
                <p class="mt-4 text-center text-gray-600">
                    Sudah punya akun? 
                    <a href="#/login" class="text-teal-500 hover:text-teal-600">Masuk</a>
                </p>
            </div>
        </div>
      </section>
    `;
  }

  async afterRender() {
    const form = document.getElementById('registerForm');
    const errorMessage = document.getElementById('errorMessage');

    form.addEventListener('submit', async (e) => {
      e.preventDefault();
      const username = document.getElementById('username').value;
      const name = document.getElementById('name').value;
      const email = document.getElementById('email').value;
      const password = document.getElementById('password').value;
      const confirmPassword = document.getElementById('confirmPassword').value;

      if (password !== confirmPassword) {
        errorMessage.textContent = 'Password tidak sama';
        errorMessage.classList.remove('hidden');
        return;
      }

      try {
        const response = await fetch('http://localhost:5000/register', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({ username, name, email, password }),
        });

        const data = await response.json();

        if (data.error) {
          errorMessage.textContent = data.message;
          errorMessage.classList.remove('hidden');
        } else {
          window.location.hash = '#/login';
        }
      } catch (error) {
        errorMessage.textContent = 'Terjadi kesalahan server';
        errorMessage.classList.remove('hidden');
      }
    });
  }
}
