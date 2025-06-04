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

      if (confirm("Apakah Anda yakin ingin menghapus cerita ini?")) {
        try {
          await presenter.deleteStory(storyId);
        } catch (error) {
          alert(error.message || "Gagal menghapus cerita");
        }
      }
    }
  });
};
