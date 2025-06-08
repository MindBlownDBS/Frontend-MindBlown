export const setupStoryActions = (
  presenter,
  containerId = "stories-container"
) => {
  const container = document.getElementById(containerId);
  if (!container) return;

  let activeMenu = null;

  container.addEventListener("click", (e) => {
    const menuBtn = e.target.closest(".story-menu-btn");
    if (menuBtn) {
      e.stopPropagation();
      const menu = menuBtn.nextElementSibling;

      document.querySelectorAll(".story-menu").forEach((m) => {
        if (m !== menu && !m.classList.contains("hidden")) {
          m.classList.add("hidden");
        }
      });

      menu.classList.toggle("hidden");
      activeMenu = menu.classList.contains("hidden") ? null : menu;
    }
  });

  document.addEventListener("click", (e) => {
    if (activeMenu && !activeMenu.classList.contains("hidden")) {
      if (
        !activeMenu.contains(e.target) &&
        !e.target.closest(".story-menu-btn")
      ) {
        activeMenu.classList.add("hidden");
        activeMenu = null;
      }
    }
  });

  container.addEventListener("click", async (e) => {
    const editBtn = e.target.closest(".edit-story-btn");
    if (editBtn) {
      e.stopPropagation();
      const menu = editBtn.closest(".story-menu");
      if (menu) menu.classList.add("hidden");
      activeMenu = null;

      const storyId = editBtn.dataset.storyId;
      const storyContainer = editBtn.closest(".story-container");

      if (!storyContainer) {
        console.error("Story container not found for edit button:", editBtn);
        return;
      }

      const currentContentElement =
        storyContainer.querySelector(".story-content p");

      if (!currentContentElement) {
        console.error(
          "Content paragraph not found within story container for story ID:",
          storyId,
          storyContainer
        );
        alert("Tidak dapat menemukan konten cerita untuk diedit.");
        return;
      }
      const currentContent = currentContentElement.textContent;

      document.dispatchEvent(
        new CustomEvent("showEditStoryModalRequest", {
          detail: { storyId, currentContent },
        })
      );
    }
  });

  container.addEventListener("click", async (e) => {
    const deleteBtn = e.target.closest(".delete-story-btn");
    if (deleteBtn) {
      e.stopPropagation();
      const menu = deleteBtn.closest(".story-menu");
      if (menu) menu.classList.add("hidden");
      activeMenu = null;

      const storyId = deleteBtn.dataset.storyId;
      const storyElement = deleteBtn.closest(".story-container");

      if (confirm("Apakah Anda yakin ingin menghapus cerita ini?")) {
        try {
          const response = await presenter.deleteStory(storyId);
          
          if (response && !response.error) {
          
            if (storyElement) {         
              storyElement.style.transition = "opacity 0.3s ease";
              storyElement.style.opacity = "0";
              
              setTimeout(() => {
                storyElement.remove();
                
                if (container.querySelectorAll(".story-container").length === 0) {
                  container.innerHTML = '<p class="text-gray-500 text-center py-8">Belum ada cerita untuk ditampilkan.</p>';
                }
                
                showSuccessToast("Cerita berhasil dihapus");
              }, 300);
               } else {
              window.location.reload();
            }
          } else {
            throw new Error(response?.message || "Gagal menghapus cerita");
          }
        } catch (error) {
          console.error("Error deleting story:", error);
          alert(error.message || "Gagal menghapus cerita");
        }
      }
    }
  });

  function showSuccessToast(message) {
    const toastElement = document.createElement("div");
    toastElement.className = "fixed bottom-4 left-1/2 transform -translate-x-1/2 bg-green-500 text-white px-4 py-2 rounded shadow-lg z-50";
    toastElement.textContent = message;
    document.body.appendChild(toastElement);
    
    setTimeout(() => {
      toastElement.style.opacity = "0";
      toastElement.style.transition = "opacity 0.5s ease";
      setTimeout(() => toastElement.remove(), 500);
    }, 3000);
  }
};
