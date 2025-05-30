import { profileTemplate, editProfileModalTemplate } from "../templates";
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

    // Event listeners
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
    sessionStorage.removeItem('welcomeModalShown');
    window.location.hash = "/";
  }
}
