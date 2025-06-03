import { storyFormTemplate, storyItemTemplate } from "../templates.js";
import StoryPresenter from "./story-presenter.js";
import { setupStoryInteractions } from "./story-interactions.js";
import { setupStoryActions } from "./story-actions.js";
import { displayAndManageEditStoryModal } from "../story/editStoryModalManager.js";

export default class StoryPage {
  _presenter = null;
  _currentUser = null;
  #editStoryModalRequestHandler = null;
  #storyDataChangedHandler = null;

  constructor() {
    this._presenter = new StoryPresenter(this);
  }

  async render() {
    try {
      this._currentUser = JSON.parse(localStorage.getItem("user")) || {};
      const username = this._currentUser?.name || "Nama Pengguna";
      const handle = this._currentUser?.username
        ? `@${this._currentUser.username}`
        : "@namapengguna";
      const profilePicture =
        this._currentUser?.profilePicture || "./images/image.png";

      return `
        <div class="ml-16 min-h-screen p-10">
          <div class="mb-1">
            <h1 class="text-2xl font-semibold text-gray-900 mb-2">Story MindBlown</h1>
            <p class="text-gray-600">Berbagi cerita, temukan makna.</p>
            <hr class="mt-4 text-gray-300">
          </div>

          <div class="grid grid-cols-2 gap-4 h-screen">
            <div class="overflow-y-auto p-6 mr-10 border-gray-200">
              <div id="stories-container" class="space-y-6">
              </div>
            </div>

            <div class="p-6">
              <div class="space-y-6 mt-4">
                ${storyFormTemplate({ username, handle, profilePicture })}
              </div>
            </div>
          </div>
        </div>
      `;
    } catch (error) {
      console.error("Error rendering StoryPage:", error);
      return `
        <div class="ml-16 min-h-screen p-10 flex justify-center items-center">
          <p class="text-red-500">Gagal memuat halaman cerita. Silakan coba lagi nanti.</p>
        </div>
      `;
    }
  }

  async afterRender() {
    try {
      await this._presenter.loadStories();

      this._setupFormSubmit();
      this.#setupEditStoryModalListener();
      this.#setupStoryDataChangedListener();
    } catch (error) {
      console.error("Error in afterRender (StoryPage):", error);
      this.showError(error.message || "Gagal memuat konten halaman cerita.");
    }
  }

  async showStories(stories) {
    const container = document.getElementById("stories-container");
    if (!container) {
      console.error("StoryPage: 'stories-container' element not found.");
      return;
    }

    if (!stories || stories.length === 0) {
      container.innerHTML =
        '<p class="text-gray-500 text-center py-8">Belum ada cerita untuk ditampilkan.</p>';
      return;
    }

    this._currentUser = this._currentUser?.username
      ? this._currentUser
      : JSON.parse(localStorage.getItem("user")) || {};

    try {
      const renderedStories = await Promise.all(
        stories.map(async (story, index) => {
          const storyId =
            story.id || story._id || story.storyId || `story-${index}`;
          const isOwner =
            !story.isAnonymous &&
            story.username === this._currentUser?.username;

          let profilePicture = "./images/image.png";
          let usernameDisplay = "Pengguna";
          let handleDisplay = "Anonim";

          if (!story.isAnonymous && story.username) {
            try {
              const userData = this._presenter?.getCompleteUserData
                ? await this._presenter.getCompleteUserData(story.username)
                : null;

              if (userData) {
                profilePicture = userData.profilePicture || profilePicture;
                usernameDisplay =
                  userData.name || story.name || usernameDisplay;
                handleDisplay = `@${userData.username || story.username}`;
              } else {
                profilePicture = story.profilePicture || profilePicture;
                usernameDisplay = story.name || usernameDisplay;
                handleDisplay = `@${story.username}`;
              }
            } catch (error) {
              console.error(
                `Error fetching profile for ${story.username}:`,
                error
              );
            }
          }

          return storyItemTemplate({
            username: usernameDisplay,
            handle: handleDisplay,
            content: story.content,
            isAnonymous: story.isAnonymous,
            storyId: storyId,
            likeCount: story.likeCount || story.likes?.length || 0,
            commentCount: story.commentCount || story.comments?.length || 0,
            viewCount: story.viewCount || story.views || 0,
            profilePicture: profilePicture,
            createdAt: story.createdAt,
            isOwner: isOwner,
          });
        })
      );

      container.innerHTML = renderedStories.join("");

      if (this._presenter) {
        setupStoryInteractions(this._presenter, "stories-container");
        setupStoryActions(this._presenter, "stories-container");
      }
    } catch (error) {
      console.error("Error rendering stories:", error);
      container.innerHTML = "<div>Error loading stories</div>";
    }
  }

  #setupEditStoryModalListener() {
    this.#editStoryModalRequestHandler = (event) => {
      const { storyId, currentContent } = event.detail;
      if (this._presenter && typeof this._presenter.editStory === "function") {
        displayAndManageEditStoryModal(
          storyId,
          currentContent,
          this._presenter
        );
      } else {
        console.error(
          "StoryPage: Presenter or presenter.editStory method is not available."
        );
        alert("Tidak dapat mengedit cerita saat ini.");
      }
    };
    document.addEventListener(
      "showEditStoryModalRequest",
      this.#editStoryModalRequestHandler
    );
  }

  #setupStoryDataChangedListener() {
    this.#storyDataChangedHandler = async (event) => {
      const { action, storyId } = event.detail;
      if (
        ["posted", "edited", "deleted", "liked", "commented"].includes(action)
      ) {
        console.log(
          "StoryPage: Reloading stories due to storyDataChanged",
          event.detail
        );
        if (this._presenter) {
          await this._presenter.loadStories();
        }
      }
    };
    document.addEventListener(
      "storyDataChanged",
      this.#storyDataChangedHandler
    );
  }
  _setupFormSubmit() {
    const chatForm = document.getElementById("chat-form");
    if (chatForm) {
      chatForm.addEventListener("submit", async (e) => {
        e.preventDefault();
        const input = document.getElementById("chat-input");
        const isAnonymousCheckbox = document.getElementById("post-anonymously");
        const isAnonymous = isAnonymousCheckbox
          ? isAnonymousCheckbox.checked
          : false;

        const submitButton = chatForm.querySelector('button[type="submit"]');
        const originalButtonText = submitButton.textContent;

        if (!input || !input.value.trim()) {
          alert("Silakan masukkan konten cerita.");
          return;
        }

        submitButton.disabled = true;
        submitButton.textContent = "Mengunggah...";
        try {
          if (this._presenter) {
            const success = await this._presenter.postNewStory(
              input.value.trim(),
              isAnonymous
            );
          }
        } catch (error) {
          console.error("Error submitting story:", error);
          alert(error.message || "Gagal mengunggah cerita.");
        } finally {
          submitButton.disabled = false;
          submitButton.textContent = originalButtonText;
        }
      });
    }
  }

  async _getProfilePicture(username) {
    if (!username) return "./images/image.png";

    try {
      const response = await getUserProfile(username);
      return response.profilePicture || "./images/image.png";
    } catch (error) {
      console.error("Error getting profile picture:", error);
      return "./images/image.png";
    }
  }

  clearForm() {
    try {
      const input = document.getElementById("chat-input");
      if (input) input.value = "";
      const checkbox = document.getElementById("post-anonymously");
      if (checkbox) checkbox.checked = false;
    } catch (error) {
      console.error("Error clearing form:", error);
    }
  }

  showError(message) {
    const container = document.getElementById("stories-container");
    if (container) {
      container.innerHTML = `<p class="text-red-500 p-4 text-center">${message}</p>`;
    } else {
      const pageContainer = document.querySelector(".ml-16.min-h-screen.p-10");
      if (pageContainer) {
        pageContainer.innerHTML = `<p class="text-red-500 p-6 text-center">${message}</p>`;
      } else {
        alert(message);
      }
    }
  }

  destroy() {
    if (this.#editStoryModalRequestHandler) {
      document.removeEventListener(
        "showEditStoryModalRequest",
        this.#editStoryModalRequestHandler
      );
      this.#editStoryModalRequestHandler = null;
    }
    if (this.#storyDataChangedHandler) {
      document.removeEventListener(
        "storyDataChanged",
        this.#storyDataChangedHandler
      );
      this.#storyDataChangedHandler = null;
    }
    console.log("StoryPage destroyed and listeners cleaned up.");
  }
}
