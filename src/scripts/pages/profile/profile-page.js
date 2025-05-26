import { profileTemplate } from "../templates";
import ProfilePresenter from "./profile-presenter";
import * as AuthModel from "../../utils/auth";

export default class ProfilePage {
  #presenter = null;

  async render() {
    const userData = JSON.parse(localStorage.getItem("user")) || {};
    return profileTemplate(userData);
  }

  async afterRender() {
    this.#presenter = new ProfilePresenter({
      view: this,
      authModel: AuthModel,
    });

    this.#setupEventListeners();
  }

  #setupEventListeners() {
    document.getElementById("logoutBtn").addEventListener("click", () => {
      this.#presenter.handleLogout();
    });

    document.getElementById("editProfileBtn").addEventListener("click", () => {
      console.log("Edit profile clicked");
    });
  }

  logoutSuccess() {
    window.location.hash = "/login";
  }
}
