async function handleCommentLike(presenter, commentId, likeBtn) {
  if (likeBtn.disabled) return;
  const originalHTML = likeBtn.innerHTML;
  likeBtn.disabled = true;

  try {
    const response = await presenter.likeExistingComment(commentId);
    console.log("Response dari server:", response); // Debug log
    console.log("Data detail dari server:", JSON.stringify(response.data)); // Debug struktur data
    
    if (!response.error) {
      const likeCountElement = likeBtn.querySelector(".comment-like-count");
      const svgIcon = likeBtn.querySelector("svg");
      
      // Akses nilai likeCount dengan benar
      const newLikeCount = response.data?.comment?.likeCount || 
                           response.data?.likeCount || 
                           response.newLikeCount || 0;
                           
      console.log(`🔍 Nilai like yang diambil: ${newLikeCount}`);
      console.log(`🔍 Path data: comment.likeCount=${response.data?.comment?.likeCount}, data.likeCount=${response.data?.likeCount}, newLikeCount=${response.newLikeCount}`);
      
      // Update jumlah like dengan nilai yang diterima dari server
      if (likeCountElement) {
        likeCountElement.textContent = String(newLikeCount);
        console.log(`🔍 Update like count element: ${likeCountElement.textContent} (dari newLikeCount: ${newLikeCount})`);
      }
      
      // Update tampilan tombol like berdasarkan status
      const isLiked = response.data?.comment?.userLiked || 
                      response.userLiked ||
                      response.message?.includes("disukai") || 
                      false;
      
      console.log(`🔍 Status like: ${isLiked}`);
      
      if (isLiked) {
        // Komentar disukai
        svgIcon.classList.add("fill-red-500", "text-red-500");
        svgIcon.classList.remove("fill-none", "text-gray-500");
        likeBtn.classList.add("liked");
        if (likeCountElement) {
          likeCountElement.classList.add("text-red-500", "font-semibold");
          likeCountElement.classList.remove("text-gray-600");
        }
      } else {
        // Komentar unlike
        svgIcon.classList.add("fill-none", "text-gray-500");
        svgIcon.classList.remove("fill-red-500", "text-red-500");
        likeBtn.classList.remove("liked");
        if (likeCountElement) {
          likeCountElement.classList.add("text-gray-600");
          likeCountElement.classList.remove("text-red-500", "font-semibold");
        }
      }
      
      console.log(`Comment ${commentId} like count updated to: ${newLikeCount}`);
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
