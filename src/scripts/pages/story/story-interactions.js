export const setupStoryInteractions = (presenter) => {
  const storiesContainer = document.getElementById("stories-container");
  if (!storiesContainer) return;

  storiesContainer.addEventListener("click", (e) => {
    const storyContainer = e.target.closest(".story-container");
    if (!storyContainer) return;

    const storyId = storyContainer.dataset.storyId;
    if (!storyId) return;

    if (!e.target.closest(".like-btn, .comment-btn, .view-btn, .user-info")) {
      window.location.hash = `#/story/${storyId}`;
      return;
    }

    const likeBtn = e.target.closest(".like-btn");
    if (likeBtn) {
      e.stopPropagation();
      handleLike(presenter, storyId, likeBtn);
      return;
    }

    const commentBtn = e.target.closest(".comment-btn");
    if (commentBtn) {
      e.stopPropagation();
      window.location.hash = `#/story/${storyId}`;
      return;
    }

    const viewBtn = e.target.closest(".view-btn");
    if (viewBtn) {
      e.stopPropagation();
      //
      return;
    }
  });
};

const handleLike = async (presenter, storyId, likeBtn) => {
  try {
    const newLikeCount = await presenter.likeStory(storyId);
    if (typeof newLikeCount === "number") {
      const likeCountElement = likeBtn.querySelector(".like-count");
      if (likeCountElement) {
        likeCountElement.textContent = newLikeCount;
      }
    }
  } catch (error) {
    console.error("Error handling like:", error);
  }
};

const handleComment = async (presenter, storyId, commentBtn) => {
  try {
    const commentContent = prompt("Masukkan komentar Anda:");
    if (commentContent) {
      const newCommentCount = await presenter.addComment(
        storyId,
        commentContent
      );
      if (newCommentCount !== null) {
        const commentCountElement = commentBtn.querySelector(".comment-count");
        if (commentCountElement) {
          commentCountElement.textContent = newCommentCount;
        }
      }
    }
  } catch (error) {
    console.error("Error handling comment:", error);
  }
};
