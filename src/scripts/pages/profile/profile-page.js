import { profileTemplate, editProfileModalTemplate } from "../templates";
import ProfilePresenter from "./profile-presenter";
import * as AuthModel from "../../utils/auth";
import { storyItemTemplate } from "../templates";
import { setupStoryInteractions } from "../story/story-interactions";

export default class ProfilePage {
  #presenter = null;
  #currentUser = null;

  async render() {
    this.#currentUser = JSON.parse(localStorage.getItem("user")) || {};
    return profileTemplate(this.#currentUser);
  }

  async afterRender() {
    this.#presenter = new ProfilePresenter({
      view: this,
      authModel: AuthModel,
    });

    await this.#presenter.loadUserProfile();
    this.#setupEventListeners();
  }

  #setupStoryUpdatesListener() {
    document.addEventListener("storyUpdated", async () => {
      await this.#presenter.loadUserProfile();
    });
  }

  #setupEventListeners() {
    document.getElementById("logoutBtn").addEventListener("click", () => {
      this.#presenter.handleLogout();
    });

    document.getElementById("editProfileBtn").addEventListener("click", () => {
      const userData = JSON.parse(localStorage.getItem("user")) || {};
      this.#showEditProfileModal(userData);
    });
  }

  #showEditProfileModal(userData) {
    const existingModal = document.getElementById("editProfileModal");
    if (existingModal) {
      existingModal.remove();
    }

    document.body.insertAdjacentHTML(
      "beforeend",
      editProfileModalTemplate(userData)
    );

    const modal = document.getElementById("editProfileModal");
    const closeBtn = document.getElementById("closeEditProfileModalBtn");
    const cancelBtn = document.getElementById("cancelEditBtn");
    const form = document.getElementById("editProfileForm");
    const changePhotoBtn = document.getElementById("changePhotoBtn");
    const profilePictureInput = document.getElementById("profilePictureInput");
    const profileImagePreview = document.getElementById("profileImagePreview");

    modal.classList.remove("hidden");
    modal.classList.add("flex");

    closeBtn.addEventListener("click", () => this.#closeModal(modal));
    cancelBtn.addEventListener("click", () => this.#closeModal(modal));

    modal.addEventListener("click", (e) => {
      if (e.target === modal) {
        this.#closeModal(modal);
      }
    });

    changePhotoBtn.addEventListener("click", () => {
      profilePictureInput.click();
    });

    profilePictureInput.addEventListener("change", (e) => {
      const file = e.target.files[0];
      if (file) {
        const reader = new FileReader();
        reader.onload = (event) => {
          profileImagePreview.src = event.target.result;
        };
        reader.readAsDataURL(file);
      }
    });

    form.addEventListener("submit", async (e) => {
      e.preventDefault();

      const formData = new FormData(form);
      const updatedData = {
        name: formData.get("name"),
        username: formData.get("username"),
      };

      if (profilePictureInput.files[0]) {
        const file = profilePictureInput.files[0];
        if (file.size > 2 * 1024 * 1024) {
          alert("Ukuran gambar terlalu besar. Maksimal 2MB");
          return;
        }

        updatedData.profilePicture = await this.#convertImageToBase64(file);
      }

      try {
        const result = await this.#presenter.updateProfile(updatedData);
        if (result && !result.error) {
          this.#closeModal(modal);
          await this.#presenter.loadUserProfile();
        }
      } catch (error) {
        alert(error.message);
      }
    });
  }

  #closeModal(modal) {
    modal.classList.add("hidden");
    modal.classList.remove("flex");
    setTimeout(() => modal.remove(), 300);
  }

  async #convertImageToBase64(file) {
    return new Promise((resolve, reject) => {
      const reader = new FileReader();
      reader.readAsDataURL(file);
      reader.onload = () => resolve(reader.result);
      reader.onerror = (error) => reject(error);
    });
  }

  showUserStories(stories) {
    const storiesContainer = document.getElementById("user-stories-container");
    if (!storiesContainer) return;

    if (stories.length === 0) {
      storiesContainer.innerHTML =
        '<p class="text-gray-500 text-center py-8">Belum ada unggahan</p>';
      return;
    }

    storiesContainer.innerHTML = stories
      .map((story) => {
        const profilePic = story.isAnonymous
          ? "./images/image.png"
          : this.#currentUser.profilePicture || "./images/image.png";

        return storyItemTemplate({
          username: story.isAnonymous ? "Pengguna" : this.#currentUser.name,
          handle: story.isAnonymous
            ? "Anonim"
            : `@${this.#currentUser.username}`,
          content: story.content,
          isAnonymous: story.isAnonymous,
          storyId: story.id || story._id,
          likeCount: story.likes?.length || 0,
          commentCount: story.comments?.length || 0,
          viewCount: story.views || 0,
          profilePicture: profilePic,
        });
      })
      .join("");

    setupStoryInteractions(this.#presenter);
  }

  logoutSuccess() {
    window.location.hash = "/login";
  }
}
