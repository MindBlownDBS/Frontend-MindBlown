export default class LoginPresenter {
    #view;
    #model;

    constructor({ view, model}) {
        this.#view = view;
        this.#model = model;
    }

    async getLogin({ usernameOrEmail, password }) {
        this.#view.showSubmitLoadingButton();
        try {
            const response = await  this.#model.getLogin(usernameOrEmail, password);

            if (response.data.error) {
                this.#view.loginFailed(response.data.message);
            } else {
                localStorage.setItem('user', JSON.stringify(response.data));
                this.#view.loginSuccessfully(response.message);
                window.location.hash = '#/';
            }
        } catch (error) {
            this.#view.loginFailed(error.message);
        } finally {
            this.#view.hideSubmitLoadingButton();
        }
    }
}

