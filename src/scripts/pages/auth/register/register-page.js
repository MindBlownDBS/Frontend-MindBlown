import RegisterPresenter from './register-presenter';
import * as MindblownAPi from '../../../data/api';

export default class RegisterPage {
    #presenter = null;
    #userData = null;

    async render() {
        return `
        <div class="flex items-center justify-center min-h-screen bg-white">
            <div class="w-full max-w-xs">
                <div class="flex items-center justify-center mb-4 gap-3">
                    <img src="images/logo.png" alt="Logo" class="w-13 h-13 mb-2">
                    <h1 class="text-2xl font-semibold text-gray-800 mb-2">MindBlown</h1>
                </div>
                <form id="register-form" class="bg-[#F7F7F7] rounded-xl shadow p-5 border border-gray-400 sm:p-7">
                    <p class="mb-3 text-gray-700 text-sm">Daftar untuk ngobrolin apa pun yang kamu rasakan.</p>

                    <input id="username-input" type="text" placeholder="Nama Pengguna" class="w-full mb-3 px-3 py-2 border border-gray-400 rounded-md focus:outline-none focus:ring" required>

                    <input id="name-input" type="text" placeholder="Nama Lengkap" class="w-full mb-3 px-3 py-2 border border-gray-400 rounded-md focus:outline-none focus:ring" required>

                    <input id="email-input" type="email" placeholder="Email" class="w-full mb-3 px-3 py-2 border border-gray-400 rounded-md focus:outline-none focus:ring" required>
                    <input id="password-input" type="password" placeholder="Kata sandi" class="w-full mb-3 px-3 py-2 border border-gray-400 rounded-md focus:outline-none focus:ring" required>
                    <input id="passwordConfirm-input" type="password" placeholder="Konfirmasi kata sandi" class="w-full mb-4 px-3 py-2 border border-gray-400 rounded-md focus:outline-none focus:ring" required>

                    <div id="errorMessage" class="hidden text-red-500 text-center text-sm" role="alert"></div>   

                    <div id="submit-button-container" class="mt-3">
                        <button class="w-full bg-third text-white text-sm py-2 rounded hover:bg-teal-600 transition" type="submit">Daftar</button>
                    </div>
                    <div class="flex justify-center mt-4">
                        <p class="text-sm text-gray-500 ">Sudah punya akun? <a href="#/login" class="text-third font-semibold hover:underline">Masuk</a></p>
                    </div>
                </form>
            </div>
        </div>

        <!-- Modal Preferensi -->
        <div id="preferences-modal" class="fixed inset-0 bg-black/50 flex items-center justify-center z-50 hidden">
            <div class="bg-white rounded-lg shadow-xl w-full max-w-md p-6 mx-4">
                <h2 class="text-xl font-semibold text-gray-800 mb-4">Pilih Minat & Preferensi Kamu</h2>
                <p class="text-gray-600 mb-4">Pilih minimal satu dan maksimal tiga minat yang sesuai dengan kamu.</p>
                
                <div id="preferences-container" class="grid grid-cols-2 gap-2 mb-6 max-h-60 overflow-y-auto">
                    <!-- Preferences will be dynamically inserted here -->
                </div>
                
                <div id="preferences-error" class="hidden text-red-500 text-sm mb-4"></div>
                
                <div class="flex justify-center">
                    <button id="preferences-submit" class="px-6 py-2 bg-teal-500 text-white rounded-full hover:bg-teal-600">Simpan dan Daftar</button>
                </div>
            </div>
        </div>
    `;
    }

    async afterRender() {
        this.#presenter = new RegisterPresenter({
            view: this,
            model: MindblownAPi,
        });

        this.#setupForm();
        this.#setupPreferencesModal();
    }

    #setupForm() {
        document.getElementById('register-form').addEventListener('submit', async (event) => {
            event.preventDefault();

            const username = document.getElementById('username-input').value;
            const name = document.getElementById('name-input').value;
            const email = document.getElementById('email-input').value;
            const password = document.getElementById('password-input').value;
            const passwordConfirm = document.getElementById('passwordConfirm-input').value;

            if (password !== passwordConfirm) {
                this.registeredFailed('Konfirmasi kata sandi tidak sama dengan kata sandi!')
                return;
            }

            this.#userData = {
                username,
                name,
                preferences: [],
                email,
                password
            };

            this.#showPreferencesModal();
        });
    }

    #setupPreferencesModal() {
        const validPreferences = [
            "Olahraga", "Belajar", "Produktivitas", "Relaksasi", 
            "Hiburan", "Kesehatan", "Sosial", 
            "Kreativitas", "Hobi", "Rumah Tangga" ,"Pengembangan Diri",
        ];

        const preferencesContainer = document.getElementById('preferences-container');
        if (preferencesContainer) {
            preferencesContainer.innerHTML = validPreferences.map(pref => `
                <div class="preference-option">
                    <label class="flex items-center space-x-2 p-2 border rounded hover:bg-gray-50 cursor-pointer transition-colors">
                        <input type="checkbox" name="preference" value="${pref}" class="h-4 w-4 text-teal-500 focus:ring-teal-400">
                        <span class="text-sm">${pref}</span>
                    </label>
                </div>
            `).join('');
        }

        document.getElementById('preferences-submit')?.addEventListener('click', () => {
            const selectedPreferences = Array.from(
                document.querySelectorAll('input[name="preference"]:checked')
            ).map(checkbox => checkbox.value);

            if (selectedPreferences.length === 0) {
                document.getElementById('preferences-error').textContent = 'Pilih minimal satu preferensi untuk melanjutkan.';
                document.getElementById('preferences-error').classList.remove('hidden');
                return;
            }

            if (selectedPreferences.length > 3) {
                document.getElementById('preferences-error').textContent = 'Maksimal tiga preferensi yang bisa dipilih.';
                document.getElementById('preferences-error').classList.remove('hidden');
                return;
            }

            document.getElementById('preferences-error').classList.add('hidden');

            this.#userData.preferences = selectedPreferences;
            
            document.getElementById('preferences-modal').classList.add('hidden');
            
            this.#registerUser();
        });
    }

    #showPreferencesModal() {
        const modal = document.getElementById('preferences-modal');
        if (modal) {
            modal.classList.remove('hidden');
            
            modal.addEventListener('click', (event) => {
                if (event.target === modal) {
                    event.stopPropagation();
                }
            });
        }
    }

    async #registerUser() {
        if (!this.#userData || !this.#userData.preferences.length) return;
        
        await this.#presenter.getRegistered(this.#userData);
    }

    registeredSuccessfully(message) {
        console.log(message);
        location.hash = '/login';
    }

    registeredFailed(message) {
        const errorMessageElement = document.getElementById('errorMessage');
        errorMessageElement.textContent = message;
        errorMessageElement.classList.remove('hidden');
        
        setTimeout(() => {
            errorMessageElement.classList.add('hidden');
        }, 3000);
    }

    showSubmitLoadingButton() {
        document.getElementById('submit-button-container').innerHTML = `
            <button class="w-full bg-teal-500 text-white text-sm py-2 rounded hover:bg-teal-600 transition" type="submit" disabled>
                Loading...
            </button>
        `;
    }
    
    hideSubmitLoadingButton() {
        document.getElementById('submit-button-container').innerHTML = `
            <button class="w-full bg-teal-500 text-white text-sm py-2 rounded hover:bg-teal-600 transition" type="submit">
                Daftar akun
            </button>
        `;
    }
}