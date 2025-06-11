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
      <div class="md:ml-16 lg:ml-16 min-h-screen p-6 lg:p-10 pb-18">
        <div class="mb-1">
          <h1 class="text-2xl font-semibold text-gray-900 mb-2">Detail Story</h1>
          <p class="text-gray-600">Cerita lengkap dan komentar.</p>
          <hr class="mt-4 text-gray-300">
        </div>

        <div class="lg:grid lg:grid-cols-2 gap-4 lg:h-screen">
          <div class="lg:overflow-y-auto lg:p-6 lg:mr-10 border-gray-200">
            <div id="story-detail-container" class="space-y-6"></div>
            <div id="comments-container" class="mt-8 space-y-6">
              <h3 class="text-lg font-semibold text-gray-900 mb-4">Komentar</h3>
              <div id="comments-list" class="space-y-4">
                </div>
            </div>
          </div>
          
          <div class="hidden lg:block lg:p-6">
            <div class="space-y-6 mt-4">
              ${commentFormTemplate({ username, handle, profilePicture })}
            </div>
          </div>
        </div>

        <button id="add-comment-fab" class="fixed bottom-24 right-6 w-14 h-14 rounded-full bg-teal-500 text-white shadow-lg flex items-center justify-center z-30 lg:hidden focus:outline-none">
          <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="3" stroke-linecap="round" stroke-linejoin="round">
            <line x1="12" y1="5" x2="12" y2="19"></line>
            <line x1="5" y1="12" x2="19" y2="12"></line>
          </svg>
        </button>

        <div id="mobile-comment-modal" class="fixed inset-0 bg-white items-start justify-start z-50 hidden">
        <div class="w-full h-full">
          <div class="p-4 border-b border-gray-100 flex items-center justify-between">
            <button id="close-comment-modal" class="text-gray-700">
              <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
                <line x1="18" y1="6" x2="6" y2="18"></line>
                <line x1="6" y1="6" x2="18" y2="18"></line>
              </svg>
            </button>
            <button id="mobile-comment-submit" class="bg-teal-500 text-white px-4 py-1 rounded-full text-sm">kirim</button>
          </div>
          
          <div class="p-4">
            <div class="flex items-center gap-3 mb-4">
              <img src="${profilePicture}" alt="Profile" class="w-8 h-8 rounded-full object-cover">
              <span class="text-sm font-medium">${username}</span>
            </div>
            
            <textarea id="mobile-comment-input" class="w-full border-0 focus:ring-0 text-gray-700 resize-none h-64 placeholder-gray-400" placeholder="Tulis komentar..."></textarea>
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
    this._setupMobileCommentButton();
  }

_setupMobileCommentButton() {
  const fabButton = document.getElementById("add-comment-fab");
  const mobileModal = document.getElementById("mobile-comment-modal");
  const closeModalBtn = document.getElementById("close-comment-modal");
  const submitBtn = document.getElementById("mobile-comment-submit");
  
  if (fabButton && mobileModal) {
    fabButton.addEventListener("click", () => {
      mobileModal.classList.remove("hidden");
      mobileModal.classList.add("flex");
    });
  }
  
  if (closeModalBtn && mobileModal) {
    closeModalBtn.addEventListener("click", () => {
      mobileModal.classList.add("hidden");
      mobileModal.classList.remove("flex");
      const commentInput = document.getElementById("mobile-comment-input");
      if (commentInput) commentInput.value = "";
    });
  }
   if (submitBtn) {
    submitBtn.addEventListener("click", async () => {
      const commentInput = document.getElementById("mobile-comment-input");
      if (!commentInput || !commentInput.value.trim()) {
        alert("Silakan masukkan komentar");
        return;
      }
      
      const originalText = submitBtn.textContent;
      submitBtn.disabled = true;
      submitBtn.textContent = "Mengirim...";
      
      try {
        if (this._presenter) {
          const success = await this._presenter.addComment(
            this._storyId,
            commentInput.value.trim()
          );
          if (success) {
            commentInput.value = "";
            this._showToast("Komentar berhasil ditambahkan!");
            mobileModal.classList.add("hidden");
            mobileModal.classList.remove("flex");
          }
        }
      } catch (error) {
        console.error("Error submitting comment:", error);
        alert(
          "Gagal mengunggah komentar: " +
          (error.message || "Terjadi kesalahan")
        );
         } finally {
        submitBtn.disabled = false;
        submitBtn.textContent = originalText;
      }
    });
  }
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
    if (this._storyDataChangedHandler) {
      document.removeEventListener("storyDataChanged", this._storyDataChangedHandler);
      document.removeEventListener("commentDataChanged", this._storyDataChangedHandler);
    }

    this._storyDataChangedHandler = (event) => {

      const { action, entityId, userLiked, newLikeCount, message } = event.detail;
     

      if (action === "commentLiked" && entityId) {

        const commentElement = document.querySelector(`.comment-item-container[data-comment-id="${entityId}"]`);
       

        if (commentElement) {
          const likeBtn = commentElement.querySelector('.comment-like-btn');
          const heartSvg = likeBtn?.querySelector('svg');
          const likeCountElement = likeBtn?.querySelector('.comment-like-count');


          if (likeBtn && heartSvg && likeCountElement) {
            
            const isLiked = userLiked !== undefined ? userLiked :
              message?.includes('disukai');
           
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

            const currentCount = parseInt(likeCountElement.textContent || '0');
            let newCount;

            if (newLikeCount !== undefined && !isNaN(newLikeCount)) {
              newCount = Math.max(0, newLikeCount);
            } else {
              newCount = isLiked ? Math.max(1, currentCount) : Math.max(0, currentCount - 1);
            }

            likeCountElement.textContent = String(newCount);
                    
            return; 
          } else {
            console.warn(`⚠️ Could not find all required elements for comment ${entityId}`);
          }
        } else {
          console.warn(`⚠️ Comment element with ID ${entityId} not found`);
        }
      }

      if (this._storyId) {
        this._presenter.loadStoryDetail(this._storyId);
      }
    };

    document.addEventListener("storyDataChanged", this._storyDataChangedHandler);
    document.addEventListener("commentDataChanged", this._storyDataChangedHandler);
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
  }

  showStoryDetail(story) {
    const container = document.getElementById("story-detail-container");
    if (!container) {
      console.warn("Element with ID 'story-detail-container' not found.");
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

    parentElement.innerHTML = '';

    commentsArray.forEach((comment) => {
      const isOwner = this._currentUser?.username === comment.username;
      const tempDiv = document.createElement("div");
      
      tempDiv.innerHTML = commentItemTemplate({
        commentId: comment.id || comment._id,
        username: comment.name || "Pengguna",
        handle: comment.username,
        content: comment.content,
        profilePicture: comment.profilePicture || "./images/image.png",
        createdAt: comment.createdAt,
        likeCount: comment.likes?.length || comment.likeCount || 0,
        replyCount: comment.replies?.length || comment.replyCount || 0,
        isOwner: isOwner,
        userLiked: comment.isLiked || false,
      });
      
      const commentElement = tempDiv.firstElementChild;
      parentElement.appendChild(commentElement);
      
      const nestedRepliesContainer = commentElement.querySelector(".replies-container");
      if (nestedRepliesContainer && comment.replies && comment.replies.length > 0) {
        this._renderCommentsRecursive(comment.replies, nestedRepliesContainer, level + 1);
      }
    });
}

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
            userLiked: comment.userLiked || false,
          });
        })
        .join("");

      if (this._presenter) {
        setupCommentInteractions(this._presenter, "comments-list");
        setupCommentActions(this._presenter, "comments-list");
      }
    }
  }


  setupEventListeners() {
    const commentForm = document.getElementById("comment-form");
    if (commentForm) {
      this._setupCommentFormSubmit(commentForm);
    }
    
    const mobileModal = document.getElementById("mobile-comment-modal");
    if (mobileModal) {
      const mobileForm = mobileModal.querySelector("#comment-form");
      if (mobileForm) {
        this._setupCommentFormSubmit(mobileForm);
      }
    }
  }

  _setupCommentFormSubmit(form) {
    form.addEventListener("submit", async (e) => {
      e.preventDefault();
      const input = form.querySelector("#comment-input");
      const submitButton = form.querySelector('button[type="submit"]');
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
            const mobileModal = document.getElementById("mobile-comment-modal");
            if (mobileModal && mobileModal.classList.contains("flex")) {
              mobileModal.classList.remove("flex");
              mobileModal.classList.add("hidden");
            }
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
        submitButton.textContent = originalButtonText;
      }
    });
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
