import {
  storyItemTemplate,
  commentFormTemplate,
  commentItemTemplate,
} from "../templates.js";
import StoryPresenter from "./story-presenter.js";
import { setupStoryInteractions } from "./story-interactions.js";
import { setupStoryActions } from "../story/story-actions.js";
import { displayAndManageEditStoryModal } from "../story/editStoryModalManager.js";

export default class StoryDetailPage {
  _storyId = null;
  _presenter = null;
  _storyDataChangedHandler = null;
  #editStoryModalRequestHandler = null;

  constructor(storyId) {
    this._storyId = storyId;
    this._presenter = new StoryPresenter(this);
  }

  async render() {
    const currentUser = this._presenter
      ? this._presenter.getCurrentUser()
      : JSON.parse(localStorage.getItem("user")) || {};
    const username = currentUser?.name || "Nama Pengguna";
    const handle = currentUser?.username
      ? `@${currentUser.username}`
      : "@namapengguna";
    const profilePicture = currentUser?.profilePicture || "./images/image.png";

    return `
      <div class="ml-16 min-h-screen p-10">
        <div class="mb-1">
          <h1 class="text-2xl font-semibold text-gray-900 mb-2">Detail Story</h1>
          <p class="text-gray-600">Cerita lengkap dan komentar.</p>
          <hr class="mt-4 text-gray-300">
        </div>

        <div class="grid grid-cols-2 gap-4 h-screen">
          <div class="overflow-y-auto p-6 mr-10 border-gray-200">
            <div id="story-detail-container" class="space-y-6"></div>
            <div id="comments-container" class="mt-8 space-y-6">
              <h3 class="text-lg font-semibold text-gray-900 mb-4">Komentar</h3>
              <div id="comments-list" class="space-y-4">
                </div>
            </div>
          </div>

          <div class="p-6">
            <div class="space-y-6 mt-4">
              ${commentFormTemplate({ username, handle, profilePicture })}
            </div>
          </div>
        </div>
      </div>
    `;
  }

  async afterRender() {
    if (!this._presenter) return;

    await this._presenter.loadStoryDetail(this._storyId);

    this.setupEventListeners();
    this._setupStoryDataChangedListener();
    this.#setupEditStoryModalListener();
  }

  #setupEditStoryModalListener() {
    this.#editStoryModalRequestHandler = (event) => {
      const { storyId, currentContent } = event.detail;
      if (storyId === this._storyId) {
        if (
          this._presenter &&
          typeof this._presenter.editStory === "function"
        ) {
          displayAndManageEditStoryModal(
            storyId,
            currentContent,
            this._presenter
          );
        } else {
          console.error(
            "StoryDetailPage: Presenter or presenter.editStory method is not available."
          );
        }
      }
    };
    document.addEventListener(
      "showEditStoryModalRequest",
      this.#editStoryModalRequestHandler
    );
  }

  _setupStoryDataChangedListener() {
    this._storyDataChangedHandler = async (event) => {
      const { storyId: eventStoryId, action } = event.detail;
      if (eventStoryId === this._storyId) {
        console.log(
          "StoryDetailPage: storyDataChanged event for current story, reloading.",
          event.detail
        );
        if (this._presenter) {
          await this._presenter.loadStoryDetail(this._storyId);
        }
      }
    };
    document.addEventListener(
      "storyDataChanged",
      this._storyDataChangedHandler
    );
  }

  destroy() {
    if (this._storyDataChangedHandler) {
      document.removeEventListener(
        "storyDataChanged",
        this._storyDataChangedHandler
      );
      this._storyDataChangedHandler = null;
    }
    if (this.#editStoryModalRequestHandler) {
      document.removeEventListener(
        "showEditStoryModalRequest",
        this.#editStoryModalRequestHandler
      );
      this.#editStoryModalRequestHandler = null;
    }
    console.log("StoryDetailPage destroyed and listeners cleaned up.");
  }

  showStoryDetail(story) {
    const container = document.getElementById("story-detail-container");
    if (!container) {
      console.error("Element with ID 'story-detail-container' not found.");
      return;
    }

    const currentUserFromStorage =
      JSON.parse(localStorage.getItem("user")) || {};
    const isOwner =
      !story.isAnonymous && story.username === currentUserFromStorage.username;
    const storyIdToUse = story._id || story.id || this._storyId;

    container.innerHTML = storyItemTemplate({
      username: story.isAnonymous ? "Pengguna" : story.name,
      handle: story.isAnonymous ? "Anonim" : `@${story.username}`,
      content: story.content,
      isAnonymous: story.isAnonymous,
      likeCount: story.likeCount || story.likes?.length || 0,
      commentCount: story.commentCount || story.comments?.length || 0,
      viewCount: story.views || 0,
      storyId: storyIdToUse,
      profilePicture: story.profilePicture,
      createdAt: story.createdAt,
      isOwner,
    });

    if (this._presenter) {
      setupStoryInteractions(this._presenter, "story-detail-container");
      setupStoryActions(this._presenter, "story-detail-container");
    }

    const commentsListContainer = document.getElementById("comments-list");
    if (story.comments && story.comments.length > 0) {
      this.showComments(story.comments);
    } else if (commentsListContainer) {
      commentsListContainer.innerHTML =
        '<p class="text-gray-500 text-sm">Belum ada komentar.</p>';
    }
  }

  showComments(comments) {
    const container = document.getElementById("comments-list");
    if (container) {
      container.innerHTML = comments
        .map((comment) => {
          return commentItemTemplate({
            username: comment.username || "Pengguna",
            content: comment.content,
            timestamp: comment.createdAt || new Date().toISOString(),
            profilePicture: comment.profilePicture || "./images/image.png",
          });
        })
        .join("");
    }
  }

  setupEventListeners() {
    const commentForm = document.getElementById("comment-form");
    if (commentForm) {
      commentForm.addEventListener("submit", async (e) => {
        e.preventDefault();
        const input = document.getElementById("comment-input");
        const submitButton = commentForm.querySelector('button[type="submit"]');
        const originalButtonText = submitButton.textContent;

        if (!input || !input.value.trim()) {
          alert("Silakan masukkan komentar");
          return;
        }

        submitButton.disabled = true;
        submitButton.textContent = "Mengunggah...";

        try {
          if (this._presenter) {
            const success = await this._presenter.addComment(
              this._storyId,
              input.value.trim()
            );
            if (success) {
              input.value = "";
              this._showToast("Komentar berhasil ditambahkan!");
            }
          }
        } catch (error) {
          console.error("Error submitting comment:", error);
          alert(
            "Gagal mengunggah komentar: " +
              (error.message || "Terjadi kesalahan")
          );
        } finally {
          submitButton.disabled = false;
          submitButton.textContent = "Unggah";
        }
      });
    }
  }

  _showToast(message) {
    const toastId = "toast-notification";
    let toast = document.getElementById(toastId);
    if (toast) toast.remove();

    toast = document.createElement("div");
    toast.id = toastId;
    toast.className =
      "fixed bottom-4 right-4 bg-green-500 text-white px-4 py-2 rounded shadow-lg z-[1000]";
    toast.textContent = message;
    document.body.appendChild(toast);

    setTimeout(() => {
      toast.remove();
    }, 3000);
  }

  showError(message) {
    const container = document.getElementById("story-detail-container");
    if (container) {
      container.innerHTML = `
        <div class="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded relative" role="alert">
          <strong class="font-bold">Error!</strong>
          <span class="block sm:inline">${message}</span>
        </div>`;
    } else {
      const bodyContainer = document.querySelector(".ml-16.min-h-screen.p-10");
      if (bodyContainer) {
        bodyContainer.innerHTML = `<p class="text-red-500 p-6">${message}</p>`;
      } else {
        alert(message);
      }
    }
  }
}
