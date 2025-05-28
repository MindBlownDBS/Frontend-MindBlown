import { storyFormTemplate, storyItemTemplate } from "../templates";
import StoryPresenter from "./story-presenter";

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
        this._currentUser?.profilePicture || "./images/image.jpg";

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
    this._setupStoryInteractions();
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

  // _showToast(message) {
  //   const toast = document.createElement('div');
  //   toast.className = 'fixed bottom-4 right-4 bg-green-500 text-white px-4 py-2 rounded';
  //   toast.textContent = message;
  //   document.body.appendChild(toast);

  //   setTimeout(() => {
  //     toast.remove();
  //   }, 3000);
  // }

  _setupStoryInteractions() {
    const storiesContainer = document.getElementById("stories-container");
    if (!storiesContainer) return;

    storiesContainer.addEventListener("click", (e) => {
      const storyContainer = e.target.closest(".story-container");
      if (!storyContainer) return;

      // Handle story click (navigasi)
      if (!e.target.closest(".like-btn, .comment-btn, .view-btn, .user-info")) {
        const storyId = storyContainer.dataset.storyId;
        window.location.hash = `#/story/${storyId}`;
        return;
      }

      const likeBtn = e.target.closest(".like-btn");
      if (likeBtn) {
        e.stopPropagation();
        this._handleLike(likeBtn);
        return;
      }

      const commentBtn = e.target.closest(".comment-btn");
      if (commentBtn) {
        e.stopPropagation();
        this._handleComment(commentBtn);
      }
    });
  }

  async _handleLike(likeBtn) {
    try {
      const storyId = likeBtn.dataset.storyId;
      if (!storyId) {
        console.error("No story ID found for like button");
        return;
      }

      const newLikeCount = await this._presenter.likeStory(storyId);
      if (newLikeCount !== null && newLikeCount !== undefined) {
        const likeCountElement = likeBtn.querySelector(".like-count");
        if (likeCountElement) {
          likeCountElement.textContent = newLikeCount;
        }
      }
    } catch (error) {
      console.error("Error handling like:", error);
      alert("Failed to like the story. Please try again.");
    }
  }

  async _handleComment(commentBtn) {
    try {
      const storyId = commentBtn.dataset.storyId;
      const commentContent = prompt("Masukkan komentar Anda:");
      if (commentContent) {
        const newCommentCount = await this._presenter.addComment(
          storyId,
          commentContent
        );
        if (newCommentCount !== null) {
          const commentCountElement =
            commentBtn.querySelector(".comment-count");
          if (commentCountElement) {
            commentCountElement.textContent = newCommentCount;
          }
        }
      }
    } catch (error) {
      console.error("Error handling comment:", error);
    }
  }

  showStories(stories) {
    const container = document.getElementById("stories-container");
    if (!container) return;

    try {
      container.innerHTML = stories
        .map((story) =>
          storyItemTemplate({
            username: story.isAnonymous ? "Pengguna" : story.name,
            handle: story.isAnonymous ? "Anonim" : `@${story.username}`,
            content: story.content,
            isAnonymous: story.isAnonymous,
            storyId: story.id,
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
