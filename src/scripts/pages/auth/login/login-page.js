import LoginPresenter from './login-presenter';
import * as MindblownAPi from '../../../data/api';
import * as AuthModel from '../../../utils/auth';

export default class LoginPage {
    #presenter = null;

    async render() {
        return `
         <div class="flex items-center justify-center min-h-screen bg-white">
            <div class="w-full max-w-xs">
                <div class="flex items-center justify-center mb-4 gap-3">
                    <img src="images/logo.png" alt="Logo" class="w-13 h-13 mb-2">
                    <h1 class="text-2xl font-semibold text-gray-800 mb-2">MindBlown</h1>
                </div>
                <form id="login-form" class="bg-[#F7F7F7] rounded-xl shadow p-6 border border-gray-400">
                    <p class="mb-3 text-gray-700 text-sm">Masuk untuk ngobrolin apa pun yang kamu rasakan.</p>
                    <input id="email-input" placeholder="Email / Username" class="w-full mb-3 px-3 py-2 border border-gray-400 rounded-md focus:outline-none focus:ring" required>
                    <input id="password-input" type="password" placeholder="Kata sandi" class="w-full mb-4 px-3 py-2 border border-gray-400 rounded-md focus:outline-none focus:ring" required>
                    <div id="errorMessage" class="hidden text-red-500 text-center text-sm" role="alert"></div>

                    <div id="submit-button-container" class="mt-3">
                        <button class="w-full bg-third text-white text-sm py-2 rounded hover:bg-teal-600 transition" type="submit">Masuk</button>
                    </div>
                    
                    <div class="flex justify-center mt-4">
                        <p class="text-sm text-gray-500 ">Belum punya akun? <a href="#/register" class="text-third font-semibold hover:underline">Daftar</a></p>
                    </div>
                </form>
            </div>
        </div>
    `;
    }

    async afterRender() {
        this.#presenter = new LoginPresenter({
            view: this,
            model: MindblownAPi,
            authModel: AuthModel,
        });
        this.#setupForm();
    }

    #setupForm() {
        document
            .getElementById('login-form')
            .addEventListener('submit', async (event) => {
                event.preventDefault();

                const data = {
                    usernameOrEmail:
                        document.getElementById('email-input').value,
                    password: document.getElementById('password-input').value,
                };
                await this.#presenter.getLogin(data);
            });
    }

    loginSuccessfully(message) {
        console.log(message);

        location.hash = '/';
    }

    loginFailed(message) {
        const errorMessageElement = document.getElementById('errorMessage');
        errorMessageElement.textContent = message;
        errorMessageElement.classList.remove('hidden');

        setTimeout(() => {
            errorMessageElement.classList.add('hidden');
        }, 3000);
    }

    showSubmitLoadingButton() {
        document.getElementById('submit-button-container').innerHTML = `
            <button class="w-full bg-teal-500 text-white text-sm py-2 rounded hover:bg-teal-600 transition flex items-center justify-center gap-2" type="submit" disabled>
                Loading...
            </button>
        `;
    }

    hideSubmitLoadingButton() {
        document.getElementById('submit-button-container').innerHTML = `
            <button class="w-full bg-teal-500 text-white text-sm py-2 rounded hover:bg-teal-600 transition" type="submit">Masuk</button>
        `;
    }
}
