export const setupStoryInteractions = (
  presenter,
  containerId = "stories-container"
) => {
  const storiesContainer = document.getElementById(containerId);
  if (!storiesContainer) {
    console.error(`Container with ID '${containerId}' not found`);
    return;
  }

  const handlerKey = `_storyInteractionHandler_${containerId}`;
  if (storiesContainer[handlerKey]) {
    storiesContainer.removeEventListener("click", storiesContainer[handlerKey]);
    delete storiesContainer[handlerKey];
  }

  const clickHandler = async (e) => {

    const storyContainer = e.target.closest(".story-container");
    if (!storyContainer) return;

    const storyId = storyContainer.dataset.storyId;
    if (!storyId) return;

    const likeButton = e.target.closest(".like-btn");
    if (likeButton) {
      e.preventDefault();
      e.stopPropagation();
      await handleLike(presenter, storyId, likeButton);
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

    if (
      e.target.closest(".story-menu-btn") ||
      e.target.closest(".story-menu") ||
      e.target.closest(".three-dots-menu")
    ) {
      return;
    }

    if (e.target.closest(".user-info")) {
      return;
    }

    // Default: navigate to story detail for other clicks
    if (
      !e.target.closest(".like-btn") &&
      !e.target.closest(".comment-btn") &&
      !e.target.closest(".view-btn")
    ) {
      window.location.hash = `#/story/${storyId}`;
    }
  };

  storiesContainer[handlerKey] = clickHandler;
  storiesContainer.addEventListener("click", clickHandler);
};

const handleLike = async (presenter, storyId, likeBtn) => {
  const heartSvg = likeBtn.querySelector('svg');
  const likeCountElement = likeBtn.querySelector('.like-count');
  
  if (!heartSvg || !likeCountElement) {
    console.error("Like button elements not found");
    return;
  }

  if (likeBtn.disabled) return;

  const wasLiked = likeBtn.classList.contains('liked');
  const currentCount = parseInt(likeCountElement.textContent) || 0;

  console.log(`🎯 Like action:`, {
    storyId,
    wasLiked,
    currentCount
  });


  likeBtn.disabled = true;
  likeBtn.style.pointerEvents = 'none';

  try {
    updateLikeUI(likeBtn, heartSvg, likeCountElement, !wasLiked, wasLiked ? currentCount - 1 : currentCount + 1);

    if (!wasLiked) {
      heartSvg.classList.add('like-heart-beat');
      setTimeout(() => heartSvg.classList.remove('like-heart-beat'), 600);
    }

    const response = await presenter.likeStory(storyId);
    console.log(`✅ ${wasLiked ? 'Unliked' : 'Liked'} story:`, response);

    if (response?.data?.story) {
      const story = response.data.story;
      updateLikeUI(
        likeBtn, 
        heartSvg, 
        likeCountElement, 
        story.userLiked || false, 
        story.likeCount || 0
      );
    }

  } catch (error) {
    console.error("Failed to like/unlike story:", error);
    
    updateLikeUI(likeBtn, heartSvg, likeCountElement, wasLiked, currentCount);
    
    alert(error.message || "Gagal melakukan like/unlike");
  } finally {
    setTimeout(() => {
      likeBtn.disabled = false;
      likeBtn.style.pointerEvents = '';
    }, 500);
  }
};


const updateLikeUI = (likeBtn, heartSvg, likeCountElement, isLiked, count) => {
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
  
  likeCountElement.textContent = Math.max(0, count);
};

