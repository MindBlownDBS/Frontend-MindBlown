export default class LoginPresenter {
    #view;
    #model;
    #authModel;

    constructor({ view, model, authModel }) {
        this.#view = view;
        this.#model = model;
        this.#authModel = authModel;
    }

    async getLogin({ usernameOrEmail, password }) {
        this.#view.showSubmitLoadingButton();
        try {
            const response = await this.#model.getLogin(
                usernameOrEmail,
                password
            );

            if (response.error || response.status >= 400) {
                this.#view.loginFailed(response.message);
            } else {
                localStorage.setItem('user', JSON.stringify(response.data));
                localStorage.removeItem('hasInteractedWithChatbot');

                this.#view.loginSuccessfully(response.message);
                window.location.hash = '#/';

                this.#authModel.putAccessToken(response.data.token);
            }
        } catch (error) {
            this.#view.loginFailed(error.message);
        } finally {
            this.#view.hideSubmitLoadingButton();
        }
    }
}
