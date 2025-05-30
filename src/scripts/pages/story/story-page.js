import { storyFormTemplate, storyItemTemplate } from "../templates";
import StoryPresenter from "./story-presenter";
import { setupStoryInteractions } from "./story-interactions";

export default class StoryPage {
  constructor() {
    this._presenter = new StoryPresenter(this);
    this._currentUser = null;
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
      return "<div>Error loading page content</div>";
    }
  }

  async afterRender() {
    try {
      await this._presenter.loadStories();
      this._setupEventListeners();
    } catch (error) {
      console.error("Error in afterRender:", error);
    }
  }

  _setupEventListeners() {
    this._setupFormSubmit();
    setupStoryInteractions(this._presenter);
  }

  _setupFormSubmit() {
    const chatForm = document.getElementById("chat-form");
    if (chatForm) {
      chatForm.addEventListener("submit", async (e) => {
        e.preventDefault();
        const input = document.getElementById("chat-input");
        const isAnonymous = document.getElementById("post-anonymously").checked;

        const submitButton = chatForm.querySelector('button[type="submit"]');
        submitButton.disabled = true;
        submitButton.textContent = "Mengunggah...";

        try {
          if (input?.value.trim()) {
            const success = await this._presenter.postNewStory(
              input.value.trim(),
              isAnonymous
            );
            if (success) {
              this._showToast("Cerita berhasil diunggah!");
            }
          } else {
            alert("Silakan masukkan konten cerita");
          }
        } catch (error) {
          console.error("Error submitting story:", error);
        } finally {
          submitButton.disabled = false;
          submitButton.textContent = "Unggah";
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

  async showStories(stories) {
    const container = document.getElementById("stories-container");
    if (!container) return;

    try {
      const storiesWithImages = await Promise.all(
        stories.map(async (story, index) => {
          const storyId =
            story.id || story._id || story.storyId || `story-${index}`;

          let profilePicture = "./images/image.png";

          if (!story.isAnonymous && story.username) {
            try {
              const userData = await this._presenter.getCompleteUserData(
                story.username
              );
              profilePicture = userData?.profilePicture || "./images/image.png";
            } catch (error) {
              console.error("Error getting user profile:", error);
            }
          }

          return {
            ...story,
            storyId,
            profilePicture,
            likeCount: story.likeCount || story.likes?.length || 0,
          };
        })
      );

      container.innerHTML = storiesWithImages
        .map((story) =>
          storyItemTemplate({
            username: story.isAnonymous ? "Pengguna" : story.name,
            handle: story.isAnonymous ? "Anonim" : `@${story.username}`,
            content: story.content,
            isAnonymous: story.isAnonymous,
            storyId: story.storyId,
            likeCount: story.likeCount,
            commentCount: story.comments?.length || 0,
            viewCount: story.views || 0,
            profilePicture: story.profilePicture,
          })
        )
        .join("");
    } catch (error) {
      console.error("Error showing stories:", error);
      container.innerHTML = "<div>Error loading stories</div>";
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
}
