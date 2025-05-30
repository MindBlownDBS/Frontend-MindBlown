import {
  storyFormTemplate,
  storyItemTemplate,
  commentFormTemplate,
  commentItemTemplate,
} from "../templates";
import StoryPresenter from "./story-presenter";

export default class StoryDetailPage {
  constructor(storyId) {
    this._storyId = storyId;
    this._presenter = new StoryPresenter(this);
  }

  async render() {
    const currentUser = this._presenter.getCurrentUser();
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
            <div id="comments-list" class="space-y-4"></div>
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
    await this._presenter.loadStoryDetail(this._storyId);
    this.setupEventListeners();
  }

  showStoryDetail(story) {
    const container = document.getElementById("story-detail-container");
    if (container) {
      container.innerHTML = storyItemTemplate({
        username: story.isAnonymous ? "Pengguna" : story.name,
        handle: story.isAnonymous ? "Anonim" : `@${story.username}`,
        content: story.content,
        isAnonymous: story.isAnonymous,
        likeCount: story.likeCount,
        commentCount: story.commentCount,
        viewCount: story.viewCount,
        storyId: story._id,
        profilePicture: story.profilePicture,
      });
    }

    if (story.comments && story.comments.length > 0) {
      this.showComments(story.comments);
    }
  }

  showComments(comments) {
    const container = document.getElementById("comments-list");
    if (container) {
      container.innerHTML = comments
        .map((comment) =>
          commentItemTemplate({
            username: comment.username || "Pengguna",
            content: comment.content,
            timestamp: comment.createdAt || new Date().toISOString(),
            profilePicture: comment.profilePicture || "./images/image.png",
          })
        )
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

        submitButton.disabled = true;
        submitButton.textContent = "Mengunggah...";

        try {
          if (input?.value.trim()) {
            const success = await this._presenter.addComment(
              this._storyId,
              input.value.trim()
            );
            if (success) {
              input.value = "";
              this._showToast("Komentar berhasil ditambahkan!");
              await this._presenter.loadStoryDetail(this._storyId);
            }
          } else {
            alert("Silakan masukkan komentar");
          }
        } catch (error) {
          console.error("Error submitting comment:", error);
          alert("Gagal mengunggah komentar: " + error.message);
        } finally {
          submitButton.disabled = false;
          submitButton.textContent = "Unggah";
        }
      });
    }
  }

  _showToast(message) {
    const toast = document.createElement("div");
    toast.className =
      "fixed bottom-4 right-4 bg-green-500 text-white px-4 py-2 rounded";
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
      <div class="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded">
        <strong>Error!</strong> ${message}
      </div>
    `;
    }
  }
}
