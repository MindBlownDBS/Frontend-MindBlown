import { commentItemTemplate, replyFormTemplate } from "../templates.js";
import StoryPresenter from "./story-presenter.js";
import { setupCommentInteractions } from "./comment-interactions.js";
import { setupCommentActions } from "./comment-actions.js";

export default class CommentDetailPage {
  _commentId = null;
  _presenter = null;
  _commentDataChangedHandler = null;
  _currentUser = null;

  constructor(commentId) {
    this._commentId = commentId;
    this._presenter = new StoryPresenter(this);
    this._currentUser = this._presenter.getCurrentUser();
  }

  async render() {
    const username = this._currentUser?.name || "Nama Pengguna";
    const handle = this._currentUser?.username
      ? `@${this._currentUser.username}`
      : "@namapengguna";
    const profilePicture =
      this._currentUser?.profilePicture || "./images/image.png";

    return `
      <div class="md:ml-16 lg:ml-16 min-h-screen lg:p-10 p-6 pb-20 lg:pb-10">
        <div class="mb-1">
            <h1 class="text-2xl font-semibold text-gray-900 mb-2">Detail Komentar</h1>
            <p class="text-gray-600">Lihat komentar dan balasannya.</p>
            <hr class="mt-4 text-gray-300">
        </div>

        <div class="lg:grid lg:grid-cols-2 gap-4 h-screen">
            <div class="overflow-y-auto lg:p-6 lg:mr-10 border-gray-200">
            <div id="parent-comment-container" class="space-y-6"></div>
            <h3 class="text-lg font-semibold text-gray-900 mt-6">Balasan</h3>

            <div id="replies-list-container" class="mt-6 space-y-6">
                <h3 class="text-lg font-semibold text-gray-900 mb-4">Semua Balasan</h3>
            </div>
            </div>

            <div class="hidden lg:p-6 lg:block">
            <div class="lg:space-y-6 mt-4">
                ${replyFormTemplate({
                  parentCommentId: this._commentId,
                  username,
                  handle,
                  profilePicture,
                })}
            </div>
            </div>
        </div>

        <button id="add-reply-fab" class="fixed bottom-24 right-6 w-14 h-14 rounded-full bg-teal-500 text-white shadow-lg flex items-center justify-center z-30 lg:hidden focus:outline-none">
          <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="3" stroke-linecap="round" stroke-linejoin="round">
            <line x1="12" y1="5" x2="12" y2="19"></line>
            <line x1="5" y1="12" x2="19" y2="12"></line>
          </svg>
        </button>

         <div id="mobile-reply-modal" class="fixed inset-0 bg-white items-start justify-start z-50 hidden">
          <div class="w-full h-full">
            <div class="p-4 border-b border-gray-100 flex items-center justify-between">
              <button id="close-reply-modal" class="text-gray-700">
                <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
                  <line x1="18" y1="6" x2="6" y2="18"></line>
                  <line x1="6" y1="6" x2="18" y2="18"></line>
                </svg>
              </button>
              <button id="mobile-reply-submit" class="bg-teal-500 text-white px-4 py-1 rounded-full text-sm">Posting</button>
            </div>
            
            <div class="p-4">
              <div class="flex items-center gap-3 mb-4">
                <img src="${profilePicture}" alt="Profile" class="w-8 h-8 rounded-full object-cover">
                <span class="text-sm font-medium">${username}</span>
              </div>
              
              <textarea id="mobile-reply-input" class="w-full text-gray-700 resize-none h-64 placeholder-gray-400 border-0 focus:ring-0 focus:outline-none" placeholder="Tulis balasan..."></textarea>
            </div>
          </div>
        </div>

        </div>
    `;
  }

  async afterRender() {
    if (!this._presenter) return;
    await this._presenter.loadCommentDetail(this._commentId);
    this._setupReplyFormSubmit();
    this._setupMobileReplyForm();
    this._setupCommentDataChangedListener();
  }

  _setupMobileReplyForm() {
    const fabButton = document.getElementById("add-reply-fab");
    const mobileModal = document.getElementById("mobile-reply-modal");
    const closeModalBtn = document.getElementById("close-reply-modal");
    const submitBtn = document.getElementById("mobile-reply-submit");
    
    // Buka modal
    if (fabButton && mobileModal) {
      fabButton.addEventListener("click", () => {
        mobileModal.classList.remove("hidden");
        mobileModal.classList.add("flex");
      });
    }
    
    // Tutup modal
    if (closeModalBtn && mobileModal) {
      closeModalBtn.addEventListener("click", () => {
        mobileModal.classList.add("hidden");
        mobileModal.classList.remove("flex");
        document.getElementById("mobile-reply-input").value = "";
      });
    }

     if (submitBtn) {
      submitBtn.addEventListener("click", async () => {
        const replyInput = document.getElementById("mobile-reply-input");
        if (!replyInput || !replyInput.value.trim()) {
          alert("Silakan masukkan balasan.");
          return;
        }
        
        const originalText = submitBtn.textContent;
        submitBtn.disabled = true;
        submitBtn.textContent = "Mengirim...";
        
        try {
          const successResponse = await this._presenter.addReplyToComment(
            this._commentId,
            replyInput.value.trim()
          );
          
          if (!successResponse.error) {
            replyInput.value = "";
            mobileModal.classList.add("hidden");
            mobileModal.classList.remove("flex");
          } else {
            alert(`Gagal mengirim balasan: ${successResponse.message}`);
          }
           } catch (error) {
          console.error("Error submitting reply:", error);
          alert(
            "Gagal mengirim balasan: " + (error.message || "Terjadi kesalahan")
          );
        } finally {
          submitBtn.disabled = false;
          submitBtn.textContent = originalText;
        }
      });
    }
  }

  _setupReplyFormSubmit() {
    const replyForm = document.getElementById(`reply-form-${this._commentId}`);
    if (replyForm) {
      replyForm.addEventListener("submit", async (e) => {
        e.preventDefault();
        const input = document.getElementById(`reply-input-${this._commentId}`);
        const submitButton = replyForm.querySelector('button[type="submit"]');
        const originalButtonText = submitButton.textContent;

        if (!input || !input.value.trim()) {
          alert("Silakan masukkan balasan.");
          return;
        }

        submitButton.disabled = true;
        submitButton.textContent = "Mengirim...";

        try {
          const successResponse = await this._presenter.addReplyToComment(
            this._commentId,
            input.value.trim()
          );
          if (!successResponse.error) {
            input.value = "";
          } else {
            alert(`Gagal mengirim balasan: ${successResponse.message}`);
          }
        } catch (error) {
          console.error("Error submitting reply:", error);
          alert(
            "Gagal mengirim balasan: " + (error.message || "Terjadi kesalahan")
          );
        } finally {
          submitButton.disabled = false;
          submitButton.textContent = originalButtonText;
        }
      });
    }
  }

  _setupCommentDataChangedListener() {
    this._commentDataChangedHandler = async (event) => {
      const { entityId, action, parentId } = event.detail;

      if (
        entityId === this._commentId ||
        parentId === this._commentId ||
        (action === "replied" && event.detail.storyId === this._commentId)
      ) {
        console.log(
          "CommentDetailPage: commentDataChanged event for current comment or its replies, reloading.",
          event.detail
        );
        if (this._presenter) {
          await this._presenter.loadCommentDetail(this._commentId);
        }
      }
    };
    document.addEventListener(
      "commentDataChanged",
      this._commentDataChangedHandler
    );
  }

  showCommentDetail(commentData) {
    const parentContainer = document.getElementById("parent-comment-container");
    const repliesContainer = document.getElementById("replies-list-container");

    if (!parentContainer || !repliesContainer) {
      console.error("Comment detail page containers not found.");
      return;
    }

    this._currentUser = this._presenter.getCurrentUser();

    const parentIsOwner =
      !commentData.isCommentAnonymous &&
      this._currentUser?.username === commentData.authorActualUsername;
    parentContainer.innerHTML = commentItemTemplate({
      commentId: commentData._id,
      username: commentData.name || "Pengguna",
      handle: commentData.username || "Anonim",
      content: commentData.content,
      profilePicture: commentData.profilePicture || "./images/image.png",
      createdAt: commentData.createdAt,
      likeCount: commentData.likes?.length || commentData.likeCount || 0,
      replyCount: commentData.replies?.length || commentData.replyCount || 0,
      isOwner: this._currentUser?.username === commentData.username,
      userLiked: commentData.userLiked || false,
    });

    if (commentData.replies && commentData.replies.length > 0) {
      this._renderCommentsRecursive(commentData.replies, repliesContainer, 1);
    } else {
      repliesContainer.innerHTML =
        '<p class="text-gray-500 text-sm">Belum ada balasan untuk komentar ini.</p>';
    }

    setupCommentInteractions(this._presenter, parentContainer.id);
    setupCommentActions(this._presenter, parentContainer.id);

    setupCommentInteractions(this._presenter, repliesContainer.id);
    setupCommentActions(this._presenter, repliesContainer.id);
  }

  _renderCommentsRecursive(commentsArray, parentElement, level) {
    if (!commentsArray || commentsArray.length === 0) {
      parentElement.innerHTML =
        level === 1
          ? '<p class="text-gray-500 text-sm">Belum ada balasan.</p>'
          : "";
      return;
    }

    let allCommentsHTML = "";
    commentsArray.forEach((comment) => {
      const isOwner = this._currentUser?.username === comment.username;
      const commentHTML = commentItemTemplate({
        commentId: comment._id,
        username: comment.name || "Pengguna",
        handle: comment.username,
        content: comment.content,
        profilePicture: comment.profilePicture || "./images/image.png",
        createdAt: comment.createdAt,
        likeCount: comment.likes?.length || comment.likeCount || 0,
        replyCount: comment.replies?.length || comment.replyCount || 0,
        isOwner: isOwner,
        userLiked: comment.userLiked || false,
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

  showError(message) {
    const container = document.getElementById("parent-comment-container");
    if (container) {
      container.innerHTML = `<p class="text-red-500 p-4 text-center">${message}</p>`;
    } else {
      alert(message);
    }
  }

  destroy() {
    if (this._commentDataChangedHandler) {
      document.removeEventListener(
        "commentDataChanged",
        this._commentDataChangedHandler
      );
      this._commentDataChangedHandler = null;
    }
  }
}
