async function handleCommentLike(presenter, commentId, likeBtn) {
  if (likeBtn.disabled) return;
  const originalHTML = likeBtn.innerHTML;
  likeBtn.disabled = true;

  try {
    const response = await presenter.likeExistingComment(commentId);
    
    if (!response.error) {
      const likeCountElement = likeBtn.querySelector(".comment-like-count");
      const svgIcon = likeBtn.querySelector("svg");
      
      const newLikeCount = response.data?.comment?.likeCount || 
                           response.data?.likeCount || 
                           response.newLikeCount || 0;
      
      if (likeCountElement) {
        likeCountElement.textContent = String(newLikeCount);
      }
      
      const isLiked = response.data?.comment?.userLiked || 
                      response.userLiked ||
                      response.message?.includes("disukai") || 
                      false;
      
      
      if (isLiked) {
        svgIcon.classList.add("fill-red-500", "text-red-500");
        svgIcon.classList.remove("fill-none", "text-gray-500");
        likeBtn.classList.add("liked");
        if (likeCountElement) {
          likeCountElement.classList.add("text-red-500", "font-semibold");
          likeCountElement.classList.remove("text-gray-600");
        }
      } else {
        svgIcon.classList.add("fill-none", "text-gray-500");
        svgIcon.classList.remove("fill-red-500", "text-red-500");
        likeBtn.classList.remove("liked");
        if (likeCountElement) {
          likeCountElement.classList.add("text-gray-600");
          likeCountElement.classList.remove("text-red-500", "font-semibold");
        }
      }
      
    } else {
      alert(`Gagal menyukai komentar: ${response.message}`);
      likeBtn.innerHTML = originalHTML;
    }
  } catch (error) {
    console.error("Error handling comment like:", error);
    alert("Gagal menyukai komentar: " + (error.message || "Terjadi kesalahan"));
    likeBtn.innerHTML = originalHTML;
  } finally {
    likeBtn.disabled = false;
  }
}

export const setupCommentInteractions = (presenter, containerElementId) => {
  const container = document.getElementById(containerElementId);
  if (!container) return;

  const handlerKey = `_commentInteractionHandler_${containerElementId}`;
  if (container[handlerKey]) {
    container.removeEventListener("click", container[handlerKey]);
  }

  container[handlerKey] = async (e) => {
    const commentItem = e.target.closest(".comment-item-container");
    if (!commentItem) return;

    const commentId = commentItem.dataset.commentId;
    if (!commentId) return;

    const likeBtn = e.target.closest(".comment-like-btn");
    if (likeBtn) {
      e.stopPropagation();
      e.preventDefault();
      await handleCommentLike(presenter, commentId, likeBtn);
      return;
    }

    if (
      e.target.closest(".comment-actions-menu") ||
      e.target.closest(".comment-menu-btn")
    ) {
      return;
    }

    commentItem.style.cursor = "pointer";
    window.location.hash = `/comment/${commentId}`;
  };

  container.addEventListener("click", container[handlerKey]);
};
