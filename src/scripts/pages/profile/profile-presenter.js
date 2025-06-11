import {
  getUserProfile,
  updateProfile,
  getStories,
  likeStory,
  commentOnStory,
  editStory,
  deleteStory,
} from "../../data/api";

export default class ProfilePresenter {
  #view;
  #authModel;
  #currentStories = [];

  constructor({ view, authModel }) {
    this.#view = view;
    this.#authModel = authModel;
  }

  async loadUserProfile() {
    try {
      let userData = JSON.parse(localStorage.getItem("user")) || {};
      if (!userData.username) {
        console.warn("User data not found in localStorage for profile page.");
        throw new Error("User data not found. Please log in.");
      }

      const profileResponse = await getUserProfile(userData.username);
      if (profileResponse.error) throw new Error(profileResponse.message);

      userData = { ...userData, ...profileResponse.data };
      localStorage.setItem("user", JSON.stringify(userData));

      if (typeof this.#view.updateProfileHeaderDisplay === "function") {
        this.#view.updateProfileHeaderDisplay(userData);
      }

      const storiesResponse = await getStories();
      if (storiesResponse.error) throw new Error(storiesResponse.message);

      this.#currentStories = (storiesResponse.data || [])
        .filter(
          (story) => !story.isAnonymous && story.username === userData.username
        )
        .map((story) => ({
          ...story,
          likeCount: story.likeCount,
          userLiked: story.userLiked || false,
          commentCount: story.comments?.length || 0,
          profilePicture: userData.profilePicture || "./images/image.png",
          name: userData.name,
        }));

      this.#view.showUserStories(this.#currentStories);
      return true;
    } catch (error) {
      console.error("Failed to load profile:", error);
      return false;
    }
  }

  async updateProfile(updatedData) {
    try {
      const response = await updateProfile(updatedData);
      if (response.error) throw new Error(response.message);

      const currentUser = JSON.parse(localStorage.getItem("user")) || {};
      const refreshedUser = {
        ...currentUser,
        ...response.data,
        profilePicture:
          response.data.profilePicture || currentUser.profilePicture,
      };
      localStorage.setItem("user", JSON.stringify(refreshedUser));

      document.dispatchEvent(
        new CustomEvent("profileUpdated", { detail: refreshedUser })
      );

      if (typeof this.#view.updateProfileHeaderDisplay === "function") {
        this.#view.updateProfileHeaderDisplay(refreshedUser);
      }

      return response;
    } catch (error) {
      console.error("Failed to update profile:", error);
      throw error;
    }
  }

  isStoryOnProfile(storyId) {
    return this.#currentStories.some(
      (story) => story.id === storyId || story._id === storyId
    );
  }

  async likeStory(storyId) {
    try {
      if (!storyId) {
        throw new Error("Invalid story ID");
      }

      const responseData = await likeStory(storyId);

      if (responseData.error) {
        throw new Error(responseData.message || "Failed to like story");
      }

      return responseData;

      const storyIndex = this._stories.findIndex(
        (s) => s.id === storyId || s._id === storyId
      );
      if (storyIndex !== -1) {
        this._stories[storyIndex].likeCount = newLikeCount;
        if (Array.isArray(responseData.data?.likes))
          this._stories[storyIndex].likes = responseData.data.likes;
      }
    } catch (error) {
      console.error("ProfilePresenter: Failed to like story:", error);
      throw error;
    }
  }

  async addComment(storyId, content) {
    try {
      if (!storyId || !content) throw new Error("Invalid data for comment");

      const response = await commentOnStory(storyId, content);
      if (response.error) throw new Error(response.message);

      const storyIndex = this.#currentStories.findIndex(
        (s) => s.id === storyId || s._id === storyId
      );
      if (storyIndex !== -1) {
        this.#currentStories[storyIndex].comments =
          response.data?.comments || [];
        this.#currentStories[storyIndex].commentCount = (
          response.data?.comments || []
        ).length;
      }

      document.dispatchEvent(
        new CustomEvent("storyDataChanged", {
          detail: {
            storyId,
            action: "commented",
            comments: response.data.comments,
          },
        })
      );

      return (response.data?.comments || []).length;
    } catch (error) {
      console.error("ProfilePresenter: Failed to add comment:", error);
      throw error;
    }
  }

  async editStory(storyId, content) {
    try {
      if (!content || typeof content !== "string" || content.trim() === "") {
        throw new Error("Content is required");
      }

      const response = await editStory(storyId, content.trim());

      if (response.error) {
        throw new Error(response.message);
      }

      const storyIndex = this.#currentStories.findIndex(
        (s) => s.id === storyId || s._id === storyId
      );
      if (storyIndex !== -1) {
        this.#currentStories[storyIndex] = {
          ...this.#currentStories[storyIndex],
          content: response.data.content,
          updatedAt: response.data.updatedAt,
        };
      }

      document.dispatchEvent(
        new CustomEvent("storyDataChanged", {
          detail: {
            storyId,
            action: "edited",
            updatedStory: response.data,
          },
        })
      );

      return true;
    } catch (error) {
      console.error("ProfilePresenter: Failed to edit story:", error);
      throw error;
    }
  }

  async deleteStory(storyId) {
    try {
      const response = await deleteStory(storyId);

      if (response.error) {
        throw new Error(response.message);
      }

      this.#currentStories = this.#currentStories.filter(
        (s) => s.id !== storyId && s._id !== storyId
      );

      document.dispatchEvent(
        new CustomEvent("storyDataChanged", {
          detail: {
            storyId,
            action: "deleted",
          },
        })
      );

      return true;
    } catch (error) {
      console.error("ProfilePresenter: Failed to delete story:", error);
      throw error;
    }
  }

  handleLogout() {
    this.#authModel.getLogout();
    this.#view.logoutSuccess();
    localStorage.removeItem('user');
    localStorage.removeItem('sessionId');
    sessionStorage.removeItem('welcomeModalShown');
    localStorage.removeItem('hasInteractedWithChatbot');
  }
}
