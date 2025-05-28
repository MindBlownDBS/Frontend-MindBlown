import { profileTemplate } from "../templates";
import ProfilePresenter from "./profile-presenter";
import * as AuthModel from "../../utils/auth";
import { storyItemTemplate } from "../templates";

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

    await this.#presenter.loadUserProfile();
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

  showUserStories(stories) {
    const storiesContainer = document.querySelector(".bg-none p.text-gray-500");
    if (storiesContainer) {
      if (stories.length === 0) {
        storiesContainer.innerHTML =
          '<p class="text-gray-500 text-center py-8">Belum ada unggahan</p>';
      } else {
        storiesContainer.innerHTML = `
          <div class="space-y-6">
            ${stories
              .map((story) =>
                storyItemTemplate({
                  username: story.isAnonymous ? "Pengguna" : story.name,
                  handle: story.isAnonymous ? "Anonim" : `@${story.username}`,
                  content: story.content,
                  isAnonymous: story.isAnonymous,
                })
              )
              .join("")}
          </div>
        `;
      }
    }
  }

  logoutSuccess() {
    window.location.hash = "/login";
  }
}
