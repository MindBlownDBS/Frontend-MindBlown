import {
  storyItemTemplate,
  commentFormTemplate,
  commentItemTemplate,
} from "../templates.js";
import StoryPresenter from "./story-presenter.js";
import { setupStoryInteractions } from "./story-interactions.js";
import { setupStoryActions } from "./story-actions.js";
import { displayAndManageEditStoryModal } from "./editStoryModalManager.js";
import { setupCommentInteractions } from "./comment-interactions.js";
import { setupCommentActions } from "./comment-actions.js";

export default class StoryDetailPage {
  _storyId = null;
  _presenter = null;
  _storyDataChangedHandler = null;
  _currentUser = null;
  #editStoryModalRequestHandler = null;

  constructor(storyId) {
    this._storyId = storyId;

    this._presenter = new StoryPresenter(this);
    this._setupStoryDataChangedListener();
    this.#setupEditStoryModalListener();
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
    if (!this._presenter) {
      console.error("Presenter not initialized in afterRender.");
      return;
    }

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

  // _setupStoryDataChangedListener() {
  //   this._storyDataChangedHandler = async (event) => {
  //     const {
  //       storyId: eventStoryId,
  //       action,
  //       entityId,
  //       parentId,
  //     } = event.detail;
  //     if (
  //       eventStoryId === this._storyId ||
  //       (parentId === this._storyId && action === "commented") ||
  //       action === "commentLiked" ||
  //       action === "commentDeleted" ||
  //       action === "replied"
  //     ) {
  //       console.log(
  //         "StoryDetailPage: storyDataChanged event, reloading story details.",
  //         event.detail
  //       );
  //       if (this._presenter) {
  //         await this._presenter.loadStoryDetail(this._storyId);
  //       }
  //     }
  //   };
  //   document.addEventListener(
  //     "storyDataChanged",
  //     this._storyDataChangedHandler
  //   );
  //   document.addEventListener(
  //     "commentDataChanged",
  //     this._storyDataChangedHandler
  //   );
  // }

  _setupStoryDataChangedListener() {
    // Hapus listener lama jika ada
    if (this._storyDataChangedHandler) {
      document.removeEventListener("storyDataChanged", this._storyDataChangedHandler);
      document.removeEventListener("commentDataChanged", this._storyDataChangedHandler);
    }

    this._storyDataChangedHandler = (event) => {
      console.log("🎯 StoryDetailPage: Event received", event.type, event.detail);

      const { action, entityId, userLiked, newLikeCount, message } = event.detail;
      console.log(`🎯 Action: ${action}, EntityId: ${entityId}, UserLiked: ${userLiked}, NewLikeCount: ${newLikeCount}`);

      // Handle comment liked event without reloading
      if (action === "commentLiked" && entityId) {
        // Log detail selectors untuk debugging
        console.log(`🔍 Looking for comment element with selector: .comment-item-container[data-comment-id="${entityId}"]`);

        // Find the comment element
        const commentElement = document.querySelector(`.comment-item-container[data-comment-id="${entityId}"]`);
        console.log(`🔍 Comment element found:`, commentElement);

        if (commentElement) {
          const likeBtn = commentElement.querySelector('.comment-like-btn');
          const heartSvg = likeBtn?.querySelector('svg');
          const likeCountElement = likeBtn?.querySelector('.comment-like-count');

          console.log(`🔍 Like button:`, likeBtn);
          console.log(`🔍 Heart SVG:`, heartSvg);
          console.log(`🔍 Like count element:`, likeCountElement);

          if (likeBtn && heartSvg && likeCountElement) {
            // Gunakan nilai userLiked langsung jika tersedia
            const isLiked = userLiked !== undefined ? userLiked :
              message?.includes('disukai');

            console.log(`🎯 Updating comment like UI for ${entityId}:`, { isLiked, newLikeCount });

            // Update UI
            if (isLiked) {
              likeBtn.classList.add('liked');
              heartSvg.classList.add('fill-red-500', 'text-red-500');
              heartSvg.classList.remove('fill-none', 'text-gray-500');
              likeCountElement.classList.add('text-red-500', 'font-semibold');
              likeCountElement.classList.remove('text-gray-600');
            } else {
              likeBtn.classList.remove('liked');
              heartSvg.classList.add('fill-none', 'text-gray-500');
              heartSvg.classList.remove('fill-red-500', 'text-red-500');
              likeCountElement.classList.add('text-gray-600');
              likeCountElement.classList.remove('text-red-500', 'font-semibold');
            }

            // Selalu update count untuk kepastian UI
            // likeCountElement.textContent = newLikeCount !== undefined ? 
            //                              Math.max(0, newLikeCount) : 
            //                              parseInt(likeCountElement.textContent || '0') + (isLiked ? 1 : -1);

            const currentCount = parseInt(likeCountElement.textContent || '0');
            let newCount;

            if (newLikeCount !== undefined && !isNaN(newLikeCount)) {
              newCount = Math.max(0, newLikeCount);
            } else {
              newCount = isLiked ? Math.max(1, currentCount) : Math.max(0, currentCount - 1);
            }

            console.log(`🎯 Setting like count: ${currentCount} -> ${newCount} (isLiked: ${isLiked})`);
            likeCountElement.textContent = String(newCount);
            

            // Log untuk memastikan nilai diatur dengan benar
            console.log(`🎯 After update, count element text: "${likeCountElement.textContent}"`);

            console.log(`🎯 Like UI updated successfully`);
            return; // Skip reloading the entire story
          } else {
            console.warn(`⚠️ Could not find all required elements for comment ${entityId}`);
          }
        } else {
          console.warn(`⚠️ Comment element with ID ${entityId} not found`);
        }
      }

      console.log(`🔄 Reloading entire story for action: ${action}`);
      // For other actions or if direct update failed, reload the entire story
      if (this._storyId) {
        this._presenter.loadStoryDetail(this._storyId);
      }
    };

    // Dengarkan kedua jenis event untuk keamanan
    document.addEventListener("storyDataChanged", this._storyDataChangedHandler);
    document.addEventListener("commentDataChanged", this._storyDataChangedHandler);

    console.log("🎯 Story data changed listener set up");
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
      commentCount: story.totalCommentCount,
      viewCount: story.viewCount || story.views || 0,
      storyId: storyIdToUse,
      profilePicture: story.profilePicture,
      createdAt: story.createdAt,
      isOwner,
      userLiked: story.userLiked || false,
    });

    if (this._presenter) {
      setupStoryInteractions(this._presenter, "story-detail-container");
      setupStoryActions(this._presenter, "story-detail-container");
    }

    const commentsListContainer = document.getElementById("comments-list");
    if (!commentsListContainer) {
      console.error("Element 'comments-list' not found in StoryDetailPage.");
      return;
    }

    if (story.comments && story.comments.length > 0) {
      this._renderCommentsRecursive(story.comments, commentsListContainer, 0);
    } else {
      commentsListContainer.innerHTML =
        '<p class="text-gray-500 text-sm">Belum ada komentar.</p>';
    }

    setupCommentInteractions(this._presenter, "comments-list");
    setupCommentActions(this._presenter, "comments-list");
  }

  _renderCommentsRecursive(commentsArray, parentElement, level) {
    if (!commentsArray || commentsArray.length === 0) {
      if (level > 0) {
        parentElement.innerHTML =
          '<p class="text-gray-400 text-xs pl-4">Tidak ada balasan.</p>';
      }
      return;
    }

    this._currentUser = this._presenter.getCurrentUser();

    let allCommentsHTML = "";
    commentsArray.forEach((comment) => {
      const isOwner = this._currentUser?.username === comment.username;

      const commentHTML = commentItemTemplate({
        commentId: comment.id || comment._id,
        username: comment.name || "Pengguna",
        handle: comment.username,
        content: comment.content,
        profilePicture: comment.profilePicture || "./images/image.png",
        createdAt: comment.createdAt,
        likeCount: comment.likes?.length || comment.likeCount || 0,
        replyCount: comment.replies?.length || comment.replyCount || 0,
        isOwner: isOwner,
        userLiked: comment.userLiked || false,
      });

      const tempDiv = document.createElement("div");
      tempDiv.innerHTML = commentHTML;

      const nestedRepliesContainer =
        tempDiv.querySelector(".replies-container");
      if (
        nestedRepliesContainer &&
        comment.replies &&
        comment.replies.length > 0
      ) {
        this._renderCommentsRecursive(
          comment.replies,
          nestedRepliesContainer,
          level + 1
        );
      }
      allCommentsHTML += tempDiv.innerHTML;
    });
    parentElement.innerHTML = allCommentsHTML;
  }

  // showComments(comments) {
  //   const container = document.getElementById("comments-list");
  //   if (container) {
  //     container.innerHTML = comments
  //       .map((comment) => {
  //         return commentItemTemplate({
  //           username: comment.username || "Pengguna",
  //           content: comment.content,
  //           timestamp: comment.createdAt || new Date().toISOString(),
  //           profilePicture: comment.profilePicture || "./images/image.png",
  //         });
  //       })
  //       .join("");
  //   }
  // }

  showComments(comments) {
    const container = document.getElementById("comments-list");
    if (container) {
      this._currentUser = this._presenter.getCurrentUser();

      container.innerHTML = comments
        .map((comment) => {
          const isOwner = this._currentUser?.username === comment.username;

          return commentItemTemplate({
            commentId: comment._id || comment.id,
            username: comment.name || comment.username || "Pengguna",
            handle: comment.username ? `@${comment.username}` : "Anonim",
            content: comment.content,
            createdAt: comment.createdAt || new Date().toISOString(),
            profilePicture: comment.profilePicture || "./images/image.png",
            likeCount: comment.likeCount || comment.likes?.length || 0,
            replyCount: comment.repliesCount || comment.replies?.length || 0,
            isOwner: isOwner,
            userLiked: comment.userLiked || false, // Tambahkan parameter userLiked
          });
        })
        .join("");

      // Setup interaksi komentar setelah render
      if (this._presenter) {
        setupCommentInteractions(this._presenter, "comments-list");
        setupCommentActions(this._presenter, "comments-list");
      }
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
