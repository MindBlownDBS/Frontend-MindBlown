import { getUserProfile } from "../../data/api";
export default class ProfilePresenter {
  #view;
  #authModel;
  #stories = [];

  constructor({ view, authModel }) {
    this.#view = view;
    this.#authModel = authModel;
  }

  async loadUserProfile() {
    try {
      const userData = JSON.parse(localStorage.getItem("user")) || {};
      if (!userData.username) {
        throw new Error("User data not found");
      }

      const response = await getUserProfile(userData.username);
      if (!response.error) {
        this.#stories = response.data.stories || [];
        this.#view.showUserStories(this.#stories);
      } else {
        console.error("Error loading profile:", response.message);
      }
    } catch (error) {
      console.error("Failed to load profile:", error);
    }
  }

  handleLogout() {
    this.#authModel.getLogout();
    this.#view.logoutSuccess();
  }
}
