export default class RegisterPresenter {
    #view;
    #model;

    constructor({ view, model }) {
        this.#view = view;
        this.#model = model;
    }

    async getRegistered({ username, name, email, password }) {
        this.#view.showSubmitLoadingButton();
        try {
            console.log(username, name, email, password);
            const response = await this.#model.getRegister(username, name, email, password);

            if (response.data.error) {
                this.#view.registeredFailed(response.data.message);
            } else {
                this.#view.registeredSuccessfully(response.message);
            }
        } catch (error) {
            this.#view.registeredFailed(error.message);
        } finally {
            this.#view.hideSubmitLoadingButton();
        }
    }
}
