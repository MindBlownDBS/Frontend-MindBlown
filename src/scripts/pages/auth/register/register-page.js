import RegisterPresenter from './register-presenter';
import * as MindblownAPi from '../../../data/api';

export default class RegisterPage {
    #presenter = null;

    async render() {
        return `
         <div class="flex items-center justify-center min-h-screen bg-white">
            <div class="w-full max-w-xs">
                <div class="flex items-center justify-center mb-4 gap-3">
                    <img src="images/logo.png" alt="Logo" class="w-13 h-13 mb-2">
                    <h1 class="text-2xl font-semibold text-gray-800 mb-2">MindBlown</h1>
                </div>
                <form id="register-form" class="bg-[#F7F7F7] rounded-xl shadow p-5 border border-gray-400">
                    <p class="mb-3 text-gray-700 text-sm">Daftar untuk ngobrolin apa pun yang kamu rasakan.</p>
                    <input id="username-input" type="text" placeholder="Nama Pengguna" class="w-full mb-3 px-3 py-2 border border-gray-400 rounded-md focus:outline-none focus:ring" required>
                    <input id="name-input" type="text" placeholder="Nama Lengkap" class="w-full mb-3 px-3 py-2 border border-gray-400 rounded-md focus:outline-none focus:ring" required>
                    <input id="email-input" type="email" placeholder="Email" class="w-full mb-3 px-3 py-2 border border-gray-400 rounded-md focus:outline-none focus:ring" required>
                    <input id="password-input" type="password" placeholder="Kata sandi" class="w-full mb-3 px-3 py-2 border border-gray-400 rounded-md focus:outline-none focus:ring" required>
                    <input id="passwordConfirm-input" type="password" placeholder="Konfirmasi kata sandi" class="w-full mb-5 px-3 py-2 border border-gray-400 rounded-md focus:outline-none focus:ring" required>   
                    <div id="submit-button-container">
                        <button class="w-full bg-third text-white text-sm py-2 rounded hover:bg-teal-600 transition" type="submit">Daftar</button>
                    </div>
                    <div class="flex justify-end mt-2">
                        <a href="#/login" class="text-sm text-gray-500 hover:underline">Masuk</a>
                    </div>
                </form>
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
                alert('Konfirmasi kata sandi tidak sama dengan kata sandi!');
                return;
            }

            const data = {
                username: username,
                name: name,
                email: email,
                password: password,
            };
            await this.#presenter.getRegistered(data);
        });
    }

    registeredSuccessfully(message) {
        console.log(message);

        // Redirect
        location.hash = '/login';
    }

    registeredFailed(message) {
        alert(message);
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
