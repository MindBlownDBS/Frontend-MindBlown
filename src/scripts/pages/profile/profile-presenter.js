import { getUserProfile, updateProfile } from "../../data/api";

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

        localStorage.setItem(
          "user",
          JSON.stringify({
            ...userData,
            ...response.data,
            profilePicture:
              response.data.profilePicture || userData.profilePicture,
          })
        );
      } else {
        console.error("Error loading profile:", response.message);
      }
    } catch (error) {
      console.error("Failed to load profile:", error);
    }
  }

  async updateProfile(updatedData) {
    try {
      const response = await updateProfile(updatedData);

      if (response.error) {
        throw new Error(response.message);
      }

      const currentUser = JSON.parse(localStorage.getItem("user")) || {};
      localStorage.setItem(
        "user",
        JSON.stringify({
          ...currentUser,
          ...response.data,
        })
      );

      return response;
    } catch (error) {
      console.error("Failed to update profile:", error);
      throw error;
    }
  }

  handleLogout() {
    this.#authModel.getLogout();
    this.#view.logoutSuccess();
  }
}
