export default class RegisterPresenter {
    #view;
    #model;

    constructor({ view, model }) {
        this.#view = view;
        this.#model = model;
    }

    async getRegistered({ username, name, preferences, email, password }) {
        this.#view.showSubmitLoadingButton();
        try {

            if (!preferences || !Array.isArray(preferences) || preferences.length === 0) {
                throw new Error("Minimal satu preferensi harus dipilih");
            }

            const response = await this.#model.getRegister(username, name, preferences, email, password);

            if (response.error || response.status >= 400) {
                this.#view.registeredFailed(response.message);
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
