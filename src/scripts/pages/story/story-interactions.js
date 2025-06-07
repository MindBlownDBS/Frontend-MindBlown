export const setupStoryInteractions = (
  presenter,
  containerId = "stories-container"
) => {
  const storiesContainer = document.getElementById(containerId);
  if (!storiesContainer) {
    console.error(`Container with ID '${containerId}' not found`);
    return;
  }

  // Remove existing event listener to prevent duplicates
  const handlerKey = `_storyInteractionHandler_${containerId}`;
  if (storiesContainer[handlerKey]) {
    storiesContainer.removeEventListener("click", storiesContainer[handlerKey]);
    delete storiesContainer[handlerKey];
  }

  // Create new event handler
  const clickHandler = async (e) => {
    // Get story container and ID
    const storyContainer = e.target.closest(".story-container");
    if (!storyContainer) return;

    const storyId = storyContainer.dataset.storyId;
    if (!storyId) return;

    // Handle like button clicks
    const likeButton = e.target.closest(".like-btn");
    if (likeButton) {
      e.preventDefault();
      e.stopPropagation();
      await handleLike(presenter, storyId, likeButton);
      return;
    }

    // Handle comment button clicks - navigate to story detail
    const commentBtn = e.target.closest(".comment-btn");
    if (commentBtn) {
      e.stopPropagation();
      window.location.hash = `#/story/${storyId}`;
      return;
    }

    // Handle view button clicks - navigate to story detail
    const viewBtn = e.target.closest(".view-btn");
    if (viewBtn) {
      e.stopPropagation();
      window.location.hash = `#/story/${storyId}`;
      return;
    }

    // Ignore clicks on menu buttons
    if (
      e.target.closest(".story-menu-btn") ||
      e.target.closest(".story-menu") ||
      e.target.closest(".three-dots-menu")
    ) {
      return;
    }

    // Ignore clicks on user info
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

  // Register event listener
  storiesContainer[handlerKey] = clickHandler;
  storiesContainer.addEventListener("click", clickHandler);
};

// Handle like/unlike functionality
const handleLike = async (presenter, storyId, likeBtn) => {
  const heartSvg = likeBtn.querySelector('svg');
  const likeCountElement = likeBtn.querySelector('.like-count');
  
  if (!heartSvg || !likeCountElement) {
    console.error("Like button elements not found");
    return;
  }

  // Prevent double clicks
  if (likeBtn.disabled) return;

  const wasLiked = likeBtn.classList.contains('liked');
  const currentCount = parseInt(likeCountElement.textContent) || 0;

  console.log(`🎯 Like action:`, {
    storyId,
    wasLiked,
    currentCount
  });

  // Disable button temporarily
  likeBtn.disabled = true;
  likeBtn.style.pointerEvents = 'none';

  try {
    // Optimistic UI update
    updateLikeUI(likeBtn, heartSvg, likeCountElement, !wasLiked, wasLiked ? currentCount - 1 : currentCount + 1);

    // Add heart beat animation for likes
    if (!wasLiked) {
      heartSvg.classList.add('like-heart-beat');
      setTimeout(() => heartSvg.classList.remove('like-heart-beat'), 600);
    }

    // Call API
    const response = await presenter.likeStory(storyId);
    console.log(`✅ ${wasLiked ? 'Unliked' : 'Liked'} story:`, response);

    // Update with backend response
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
    
    // Revert UI on error
    updateLikeUI(likeBtn, heartSvg, likeCountElement, wasLiked, currentCount);
    
    alert(error.message || "Gagal melakukan like/unlike");
  } finally {
    // Re-enable button after a short delay
    setTimeout(() => {
      likeBtn.disabled = false;
      likeBtn.style.pointerEvents = '';
    }, 500);
  }
};

// Helper function to update like UI
// const updateLikeUI = (likeBtn, heartSvg, likeCountElement, isLiked, count) => {
//   if (isLiked) {
//     // Liked state
//     likeBtn.classList.add('liked');
//     heartSvg.classList.remove('text-gray-500', 'fill-none');
//     heartSvg.classList.add('text-red-500', 'fill-red-500');
//     likeCountElement.classList.remove('text-gray-600');
//     likeCountElement.classList.add('text-red-500', 'font-semibold');
//   } else {
//     // Unliked state
//     likeBtn.classList.remove('liked');
//     heartSvg.classList.remove('text-red-500', 'fill-red-500');
//     heartSvg.classList.add('text-gray-500', 'fill-none');
//     likeCountElement.classList.remove('text-red-500', 'font-semibold');
//     likeCountElement.classList.add('text-gray-600');
//   }
  
//   likeCountElement.textContent = Math.max(0, count);
// };

const updateLikeUI = (likeBtn, heartSvg, likeCountElement, isLiked, count) => {
  if (isLiked) {
    // Liked state
    likeBtn.classList.add('liked');
    heartSvg.classList.add('fill-red-500', 'text-red-500');
    heartSvg.classList.remove('fill-none', 'text-gray-500');
    likeCountElement.classList.add('text-red-500', 'font-semibold');
    likeCountElement.classList.remove('text-gray-600');
  } else {
    // Unliked state
    likeBtn.classList.remove('liked');
    heartSvg.classList.add('fill-none', 'text-gray-500');
    heartSvg.classList.remove('fill-red-500', 'text-red-500');
    likeCountElement.classList.add('text-gray-600');
    likeCountElement.classList.remove('text-red-500', 'font-semibold');
  }
  
  likeCountElement.textContent = Math.max(0, count);
};

export const setupCommentInteractions = (presenter, containerId = "comments-list") => {
  const commentsContainer = document.getElementById(containerId);
  if (!commentsContainer) return;

  // Remove existing listeners
  const handlerKey = `_commentInteractionHandler_${containerId}`;
  if (commentsContainer[handlerKey]) {
    commentsContainer.removeEventListener("click", commentsContainer[handlerKey]);
  }

  // Create new handler
  const clickHandler = async (e) => {
    // Handle like button clicks
    const likeBtn = e.target.closest(".comment-like-btn");
    if (likeBtn) {
      e.preventDefault();
      
      const commentContainer = likeBtn.closest(".comment-item-container");
      if (!commentContainer) return;
      
      const commentId = commentContainer.dataset.commentId;
      if (!commentId) return;
      
      await handleCommentLike(presenter, commentId, likeBtn);
      return;
    }
    
    // ... other handlers
  };

  // Register listener
  commentsContainer[handlerKey] = clickHandler;
  commentsContainer.addEventListener("click", clickHandler);
};

// Handle comment like/unlike
const handleCommentLike = async (presenter, commentId, likeBtn) => {
  const heartSvg = likeBtn.querySelector('svg');
  const likeCountElement = likeBtn.querySelector('.comment-like-count');
  
  if (!heartSvg || !likeCountElement) return;
  
  // Prevent double clicks
  if (likeBtn.disabled) return;
  
  const wasLiked = likeBtn.classList.contains('liked');
  const currentCount = parseInt(likeCountElement.textContent) || 0;
  
  console.log(`🎯 Comment like action:`, { commentId, wasLiked, currentCount });
  
  // Disable button temporarily
  likeBtn.disabled = true;
  
  try {
    // Optimistic UI update with animation
    updateCommentLikeUI(likeBtn, heartSvg, likeCountElement, !wasLiked, 
      wasLiked ? currentCount - 1 : currentCount + 1);
      
    if (!wasLiked) {
      heartSvg.classList.add('like-heart-beat');
      setTimeout(() => heartSvg.classList.remove('like-heart-beat'), 600);
    }
    
    // Call API
    const response = await presenter.likeComment(commentId);
    console.log('✅ Comment like response:', response);
    
    // Update with backend response
    if (response && response.data) {
      const comment = response.data;
      updateCommentLikeUI(
        likeBtn,
        heartSvg,
        likeCountElement,
        comment.userLiked || false,
        comment.likeCount || 0
      );
    }
  } catch (error) {
    console.error('Error liking comment:', error);
    // Revert UI on error
    updateCommentLikeUI(likeBtn, heartSvg, likeCountElement, wasLiked, currentCount);
  } finally {
    // Re-enable button
    setTimeout(() => {
      likeBtn.disabled = false;
    }, 500);
  }
};

// Helper function to update comment like UI
const updateCommentLikeUI = (likeBtn, heartSvg, likeCountElement, isLiked, count) => {
  if (isLiked) {
    // Liked state
    likeBtn.classList.add('liked');
    heartSvg.classList.add('fill-red-500', 'text-red-500');
    heartSvg.classList.remove('fill-none', 'text-gray-500');
    likeCountElement.classList.add('text-red-500', 'font-semibold');
    likeCountElement.classList.remove('text-gray-600');
  } else {
    // Unliked state
    likeBtn.classList.remove('liked');
    heartSvg.classList.add('fill-none', 'text-gray-500');
    heartSvg.classList.remove('fill-red-500', 'text-red-500');
    likeCountElement.classList.add('text-gray-600');
    likeCountElement.classList.remove('text-red-500', 'font-semibold');
  }
  
   const formattedCount = count !== undefined && count !== null ? Math.max(0, count) : 0;
  // likeCountElement.textContent = Math.max(0, count);
   likeCountElement.textContent = formattedCount.toString();

  
};