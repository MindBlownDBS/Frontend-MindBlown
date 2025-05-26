export default class ProfilePresenter {
  #view;
  #authModel;

  constructor({ view, authModel }) {
    this.#view = view;
    this.#authModel = authModel;
  }

  handleLogout() {
    this.#authModel.getLogout();
    this.#view.logoutSuccess();
  }
}
