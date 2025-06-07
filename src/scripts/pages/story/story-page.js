import { storyFormTemplate, storyItemTemplate } from "../templates.js";
import StoryPresenter from "./story-presenter.js";
import { setupStoryInteractions } from "./story-interactions.js";
import { setupStoryActions } from "./story-actions.js";
import { displayAndManageEditStoryModal } from "../story/editStoryModalManager.js";

export default class StoryPage {
  _presenter = null;
  _currentUser = null;
  #editStoryModalRequestHandler = null;
  #storyDataChangedHandler = null;

  constructor() {
    this._presenter = new StoryPresenter(this);
  }

  async render() {
    try {
      this._currentUser = JSON.parse(localStorage.getItem("user")) || {};
      const username = this._currentUser?.name || "Nama Pengguna";
      const handle = this._currentUser?.username
        ? `@${this._currentUser.username}`
        : "@namapengguna";
      const profilePicture =
        this._currentUser?.profilePicture || "./images/image.png";

      return `
        <div class="md:ml-16 lg:ml-16 min-h-screen p-6 lg:p-10 pb-20 lg:pb-10">
          <div class="mb-1">
            <h1 class="text-2xl font-semibold text-gray-900 mb-2">Story MindBlown</h1>
            <p class="text-gray-600">Berbagi cerita, temukan makna.</p>
            <hr class="mt-4 text-gray-300">
          </div>

          <div class="lg:grid lg:grid-cols-2 gap-4 lg:h-screen">
            <div class="overflow-y-auto lg:p-6 lg:mr-10 border-gray-200">
              <div id="stories-container" class="space-y-6">
              </div>
            </div>

            <div class="hidden lg:block lg:p-6">
              <div class="space-y-6 mt-4">
                ${storyFormTemplate({ username, handle, profilePicture })}
              </div>
            </div>
          </div>

          <button id="add-story-fab" class="fixed bottom-24 right-6 w-14 h-14 rounded-full bg-teal-500 text-white shadow-lg flex items-center justify-center z-30 lg:hidden focus:outline-none">
          <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="3" stroke-linecap="round" stroke-linejoin="round">
            <line x1="12" y1="5" x2="12" y2="19"></line>
            <line x1="5" y1="12" x2="19" y2="12"></line>
          </svg>
        </button>

         <div id="mobile-story-modal" class="fixed inset-0 bg-white items-start justify-start z-50 hidden">
            <div class="w-full h-full">
              <div class="p-4 border-b border-gray-100 flex items-center justify-between">
                <button id="close-story-modal" class="text-gray-700">
                  <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
                    <line x1="18" y1="6" x2="6" y2="18"></line>
                    <line x1="6" y1="6" x2="18" y2="18"></line>
                  </svg>
                </button>
                <button id="mobile-story-submit" class="bg-teal-500 text-white px-4 py-1 rounded-full text-sm">Posting</button>
              </div>
              
              <div class="p-4">
                <div class="flex items-center gap-3 mb-4">
                  <img src="${profilePicture}" alt="Profile" class="w-8 h-8 rounded-full object-cover">
                  <div class="dropdown relative">
                    <button class="dropdown-toggle flex items-center gap-2 border border-gray-300 rounded-full px-3 py-1 text-sm">
                      <span id="privacy-display">Pilih sebagai</span>
                      <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
                        <polyline points="6 9 12 15 18 9"></polyline>
                      </svg>
                        </button>
                    <div class="dropdown-menu hidden absolute z-10 mt-1 bg-white shadow-lg rounded-md w-full">
                      <div class="py-1">
                        <button class="privacy-option block w-full text-left px-4 py-2 text-sm hover:bg-gray-100" data-anonymous="false">Publik</button>
                        <button class="privacy-option block w-full text-left px-4 py-2 text-sm hover:bg-gray-100" data-anonymous="true">Anonim</button>
                      </div>
                    </div>
                  </div>
                </div>
                
                <textarea id="mobile-story-textarea" class="w-full border-0 focus:ring-0 text-gray-700 resize-none h-64 placeholder-gray-400" placeholder="Ada cerita apa?"></textarea>
                
                <input type="checkbox" id="mobile-post-anonymously" class="hidden" value="false">
              </div>
            </div>
          </div>        

        </div>
      `;
    } catch (error) {
      console.error("Error rendering StoryPage:", error);
      return `
        <div class="ml-16 min-h-screen p-10 flex justify-center items-center">
          <p class="text-red-500">Gagal memuat halaman cerita. Silakan coba lagi nanti.</p>
        </div>
      `;
    }
  }

  async afterRender() {
    try {
      await this._presenter.loadStories();

      this._setupFormSubmit();
      this._setupMobileFormModal();
      this.#setupEditStoryModalListener();
      this.#setupStoryDataChangedListener();
    } catch (error) {
      console.error("Error in afterRender (StoryPage):", error);
      this.showError(error.message || "Gagal memuat konten halaman cerita.");
    }
  }

   _setupMobileFormModal() {
    const fabButton = document.getElementById("add-story-fab");
    const mobileModal = document.getElementById("mobile-story-modal");
    const closeModalBtn = document.getElementById("close-story-modal");
    const submitBtn = document.getElementById("mobile-story-submit");
    const dropdownToggle = document.querySelector(".dropdown-toggle");
    const dropdownMenu = document.querySelector(".dropdown-menu");
    const privacyOptions = document.querySelectorAll(".privacy-option");
    const privacyDisplay = document.getElementById("privacy-display");
    const anonymousCheckbox = document.getElementById("mobile-post-anonymously");
    
    // Buka modal
    if (fabButton && mobileModal) {
      fabButton.addEventListener("click", () => {
        mobileModal.classList.remove("hidden");
        mobileModal.classList.add("flex");
      });
    }

    if (closeModalBtn && mobileModal) {
      closeModalBtn.addEventListener("click", () => {
        mobileModal.classList.add("hidden");
        mobileModal.classList.remove("flex");
        document.getElementById("mobile-story-textarea").value = "";
      });
    }
    
    // Toggle dropdown privacy
    if (dropdownToggle && dropdownMenu) {
      dropdownToggle.addEventListener("click", () => {
        dropdownMenu.classList.toggle("hidden");
      });
      
      // Klik diluar dropdown untuk menutup
      document.addEventListener("click", (event) => {
        if (!dropdownToggle.contains(event.target) && !dropdownMenu.contains(event.target)) {
          dropdownMenu.classList.add("hidden");
        }
      });
    }

     privacyOptions.forEach(option => {
      option.addEventListener("click", () => {
        const isAnonymous = option.getAttribute("data-anonymous") === "true";
        anonymousCheckbox.checked = isAnonymous;
        privacyDisplay.textContent = isAnonymous ? "Anonim" : "Publik";
        dropdownMenu.classList.add("hidden");
      });
    });
    
    // Submit form mobile
    if (submitBtn) {
      submitBtn.addEventListener("click", async () => {
        const content = document.getElementById("mobile-story-textarea").value.trim();
        const isAnonymous = anonymousCheckbox.checked;
        
        if (!content) {
          alert("Silakan masukkan konten cerita.");
          return;
        }

         const originalText = submitBtn.textContent;
        submitBtn.disabled = true;
        submitBtn.textContent = "Mengirim...";
        
        try {
          if (this._presenter) {
            const success = await this._presenter.postNewStory(content, isAnonymous);
            if (success) {
              document.getElementById("mobile-story-textarea").value = "";
              mobileModal.classList.add("hidden");
              mobileModal.classList.remove("flex");
            }
          }
        } catch (error) {
          console.error("Error submitting story:", error);
          alert(error.message || "Gagal mengunggah cerita.");
        } finally {
          submitBtn.disabled = false;
          submitBtn.textContent = originalText;
        }
      });
    }
  }


  async showStories(stories) {
    const container = document.getElementById("stories-container");
    if (!container) {
      console.error("StoryPage: 'stories-container' element not found.");
      return;
    }

    if (!stories || stories.length === 0) {
      container.innerHTML =
        '<p class="text-gray-500 text-center py-8">Belum ada cerita untuk ditampilkan.</p>';
      return;
    }

    this._currentUser = this._currentUser?.username
      ? this._currentUser
      : JSON.parse(localStorage.getItem("user")) || {};

    try {
      const renderedStories = await Promise.all(
        stories.map(async (story, index) => {
          const storyId =
            story.id || story._id || story.storyId || `story-${index}`;
          const isOwner =
            !story.isAnonymous &&
            story.username === this._currentUser?.username;

          let profilePicture = "./images/image.png";
          let usernameDisplay = "Pengguna";
          let handleDisplay = "Anonim";

          if (!story.isAnonymous && story.username) {
            try {
              const userData = this._presenter?.getCompleteUserData
                ? await this._presenter.getCompleteUserData(story.username)
                : null;

              if (userData) {
                profilePicture = userData.profilePicture || profilePicture;
                usernameDisplay =
                  userData.name || story.name || usernameDisplay;
                handleDisplay = `@${userData.username || story.username}`;
              } else {
                profilePicture = story.profilePicture || profilePicture;
                usernameDisplay = story.name || usernameDisplay;
                handleDisplay = `@${story.username}`;
              }
            } catch (error) {
              console.error(
                `Error fetching profile for ${story.username}:`,
                error
              );
            }
          }

          return storyItemTemplate({
            username: usernameDisplay,
            handle: handleDisplay,
            content: story.content,
            isAnonymous: story.isAnonymous,
            storyId: storyId,
            likeCount: story.likeCount || story.likes?.length || 0,
            commentCount: story.totalCommentCount,
            viewCount: story.viewCount || story.views || 0,
            profilePicture: profilePicture,
            createdAt: story.createdAt,
            isOwner: isOwner,
            userLiked: story.userLiked || false, 
          });
        })
      );

      container.innerHTML = renderedStories.join("");

      if (this._presenter) {
        setupStoryInteractions(this._presenter, "stories-container");
        setupStoryActions(this._presenter, "stories-container");
      }
    } catch (error) {
      console.error("Error rendering stories:", error);
      container.innerHTML = "<div>Error loading stories</div>";
    }
  }

  #setupEditStoryModalListener() {
    this.#editStoryModalRequestHandler = (event) => {
      const { storyId, currentContent } = event.detail;
      if (this._presenter && typeof this._presenter.editStory === "function") {
        displayAndManageEditStoryModal(
          storyId,
          currentContent,
          this._presenter
        );
      } else {
        console.error(
          "StoryPage: Presenter or presenter.editStory method is not available."
        );
        alert("Tidak dapat mengedit cerita saat ini.");
      }
    };
    document.addEventListener(
      "showEditStoryModalRequest",
      this.#editStoryModalRequestHandler
    );
  }

  #setupStoryDataChangedListener() {
    this.#storyDataChangedHandler = async (event) => {
      const { action, storyId } = event.detail;
      if (
        ["posted", "edited", "deleted", "liked", "commented"].includes(action)
      ) {
        console.log(
          "StoryPage: Reloading stories due to storyDataChanged",
          event.detail
        );
        if (this._presenter) {
          await this._presenter.loadStories();
        }
      }
    };
    document.addEventListener(
      "storyDataChanged",
      this.#storyDataChangedHandler
    );
  }
  _setupFormSubmit() {
    const chatForm = document.getElementById("chat-form");
    if (chatForm) {
      chatForm.addEventListener("submit", async (e) => {
        e.preventDefault();
        const input = document.getElementById("chat-input");
        const isAnonymousCheckbox = document.getElementById("post-anonymously");
        const isAnonymous = isAnonymousCheckbox
          ? isAnonymousCheckbox.checked
          : false;

        const submitButton = chatForm.querySelector('button[type="submit"]');
        const originalButtonText = submitButton.textContent;

        if (!input || !input.value.trim()) {
          alert("Silakan masukkan konten cerita.");
          return;
        }

        submitButton.disabled = true;
        submitButton.textContent = "Mengunggah...";
        try {
          if (this._presenter) {
            const success = await this._presenter.postNewStory(
              input.value.trim(),
              isAnonymous
            );
          }
        } catch (error) {
          console.error("Error submitting story:", error);
          alert(error.message || "Gagal mengunggah cerita.");
        } finally {
          submitButton.disabled = false;
          submitButton.textContent = originalButtonText;
        }
      });
    }
  }

  async _getProfilePicture(username) {
    if (!username) return "./images/image.png";

    try {
      const response = await getUserProfile(username);
      return response.profilePicture || "./images/image.png";
    } catch (error) {
      console.error("Error getting profile picture:", error);
      return "./images/image.png";
    }
  }

  clearForm() {
    try {
      const input = document.getElementById("chat-input");
      if (input) input.value = "";
      const checkbox = document.getElementById("post-anonymously");
      if (checkbox) checkbox.checked = false;
    } catch (error) {
      console.error("Error clearing form:", error);
    }
  }

  showError(message) {
    const container = document.getElementById("stories-container");
    if (container) {
      container.innerHTML = `<p class="text-red-500 p-4 text-center">${message}</p>`;
    } else {
      const pageContainer = document.querySelector(".ml-16.min-h-screen.p-10");
      if (pageContainer) {
        pageContainer.innerHTML = `<p class="text-red-500 p-6 text-center">${message}</p>`;
      } else {
        alert(message);
      }
    }
  }
}
