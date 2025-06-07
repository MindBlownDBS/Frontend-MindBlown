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
      <div class="ml-16 min-h-screen p-10">
        <div class="mb-1">
            <h1 class="text-2xl font-semibold text-gray-900 mb-2">Detail Komentar</h1>
            <p class="text-gray-600">Lihat komentar dan balasannya.</p>
            <hr class="mt-4 text-gray-300">
        </div>

        <div class="grid grid-cols-2 gap-4 h-screen">
            <div class="overflow-y-auto p-6 mr-10 border-gray-200">
            <div id="parent-comment-container" class="space-y-6"></div>
            <h3 class="text-lg font-semibold text-gray-900 mt-6">Balasan</h3>

            <div id="replies-list-container" class="mt-6 space-y-6">
                <h3 class="text-lg font-semibold text-gray-900 mb-4">Semua Balasan</h3>
            </div>
            </div>

            <div class="p-6">
            <div class="space-y-6 mt-4">
                ${replyFormTemplate({
                  parentCommentId: this._commentId,
                  username,
                  handle,
                  profilePicture,
                })}
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
    this._setupCommentDataChangedListener();
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
      console.log(comment);
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
    console.log("CommentDetailPage destroyed and listeners cleaned up.");
  }
}
