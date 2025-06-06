export const setupStoryInteractions = (
  presenter,
  containerId = "stories-container"
) => {
  const storiesContainer = document.getElementById(containerId);
  if (!storiesContainer) {
    return;
  }

  const handlerKey = `_storyInteractionHandler_${containerId}`;
  if (storiesContainer[handlerKey]) {
    storiesContainer.removeEventListener("click", storiesContainer[handlerKey]);
  }

  storiesContainer[handlerKey] = async (e) => {
    const storyContainer = e.target.closest(".story-container");
    if (!storyContainer) return;

    const storyId = storyContainer.dataset.storyId;
    if (!storyId) return;

    if (
      e.target.closest(".story-menu-btn") ||
      e.target.closest(".story-menu")
    ) {
      return;
    }

    if (
      !(
        e.target.closest(".like-btn") ||
        e.target.closest(".comment-btn") ||
        e.target.closest(".view-btn") ||
        e.target.closest(".user-info")
      )
    ) {
      window.location.hash = `#/story/${storyId}`;
      return;
    }

    const likeBtn = e.target.closest(".like-btn");
    if (likeBtn) {
      e.stopPropagation();
      await handleLike(presenter, storyId, likeBtn);
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
      window.location.hash = `#/story/${storyId}`;
      return;
    }
  };

  storiesContainer.addEventListener("click", storiesContainer[handlerKey]);
};

const handleLike = async (presenter, storyId, likeBtn) => {
  const likeCountText = likeBtn.querySelector(".like-count");

  try {
    const { likeCount, message } = await presenter.likeStory(storyId);

    likeCountText.innerHTML = likeCount;
  } catch (error) {
    console.error("Error handling like:", error);
    alert("Gagal menyukai cerita: " + (error.message || "Terjadi kesalahan"));
  }
};
