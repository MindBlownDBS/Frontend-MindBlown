import {
  getUserProfile,
  updateProfile,
  getStories,
  likeStory as apiLikeStory,
  commentOnStory,
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
      const userData = JSON.parse(localStorage.getItem("user")) || {};
      if (!userData.username) throw new Error("User data not found");

      const profileResponse = await getUserProfile(userData.username);
      if (profileResponse.error) throw new Error(profileResponse.message);

      const storiesResponse = await getStories();
      if (storiesResponse.error) throw new Error(storiesResponse.message);

      this.#currentStories = (storiesResponse.data || []).filter(
        (story) => !story.isAnonymous && story.username === userData.username
      );

      const updatedUser = {
        ...userData,
        ...profileResponse.data,
        profilePicture:
          profileResponse.data.profilePicture || userData.profilePicture,
      };
      localStorage.setItem("user", JSON.stringify(updatedUser));

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
      const updatedUser = {
        ...currentUser,
        ...response.data,
        profilePicture:
          response.data.profilePicture || currentUser.profilePicture,
      };
      localStorage.setItem("user", JSON.stringify(updatedUser));

      document.dispatchEvent(new CustomEvent("profileUpdated"));

      return response;
    } catch (error) {
      console.error("Failed to update profile:", error);
      throw error;
    }
  }

  async likeStory(storyId) {
    try {
      if (!storyId) throw new Error("Invalid story ID");

      const response = await apiLikeStory(storyId);
      if (response.error) throw new Error(response.message);

      const storyIndex = this.#currentStories.findIndex(
        (story) => story.id === storyId || story._id === storyId
      );

      if (storyIndex !== -1) {
        this.#currentStories[storyIndex].likes = response.data?.likes || [];
      }

      return response.data?.likes?.length || 0;
    } catch (error) {
      console.error("Failed to like story:", error);
      throw error;
    }
  }

  async addComment(storyId, content) {
    try {
      if (!storyId || !content) throw new Error("Invalid data for comment");

      const response = await commentOnStory(storyId, content);
      if (response.error) throw new Error(response.message);

      const storyIndex = this.#currentStories.findIndex(
        (story) => story.id === storyId || story._id === storyId
      );

      if (storyIndex !== -1) {
        this.#currentStories[storyIndex].comments =
          response.data?.comments || [];
      }

      return response.data?.comments?.length || 0;
    } catch (error) {
      console.error("Failed to add comment:", error);
      throw error;
    }
  }

  handleLogout() {
    this.#authModel.getLogout();
    this.#view.logoutSuccess();
  }
}
