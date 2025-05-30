import {
  getStories,
  postStory,
  likeStory,
  commentOnStory,
  getUserProfile,
  getStoryDetail,
} from "../../data/api";
import { getAccessToken } from "../../utils/auth";

export default class StoryPresenter {
  constructor(view) {
    this._view = view;
    this._stories = [];
  }

  async loadStories() {
    try {
      const response = await getStories();
      if (!response.error) {
        this._stories = (response.data || []).map((story) => ({
          ...story,
          likeCount: story.likes?.length || 0,
          commentCount: story.comments?.length || 0,
        }));
        this._view.showStories(this._stories);
      } else {
        console.error("Error loading stories:", response.message);
      }
    } catch (error) {
      console.error("Failed to load stories:", error);
    }
  }

  async postNewStory(content, isAnonymous) {
    try {
      if (!content || typeof content !== "string" || content.trim() === "") {
        throw new Error("Content is required");
      }

      const response = await postStory(content, isAnonymous);

      if (!response.error) {
        const newStory = {
          id: response.data._id || response.data.id,
          name: isAnonymous ? "Pengguna" : response.data.name,
          username: isAnonymous ? null : response.data.username,
          content: response.data.content,
          isAnonymous: response.data.isAnonymous,
          likes: response.data.likes || [],
          comments: response.data.comments || [],
          views: response.data.views || 0,
        };

        this._stories.unshift(newStory);
        this._view.showStories(this._stories);
        this._view.clearForm();
        return true;
      } else {
        throw new Error(response.message || "Failed to post story");
      }
    } catch (error) {
      console.error("Failed to post story:", error);

      if (error.message.includes("Content is required")) {
        alert("Content tidak boleh kosong");
      } else if (error.message.includes("Failed to post story")) {
        alert("Gagal mengunggah cerita: " + error.message);
      } else {
        alert("Terjadi kesalahan server. Silakan coba lagi.");
      }

      return false;
    }
  }

  getCurrentUser() {
    try {
      const userData = JSON.parse(localStorage.getItem("user")) || {};
      return userData;
    } catch (error) {
      console.error("Error getting user data:", error);
      return null;
    }
  }

  async getCompleteUserData(username) {
    try {
      if (!username) return null;

      const response = await getUserProfile(username);
      if (response.error) {
        console.error("Error getting user profile:", response.message);
        return null;
      }

      return {
        name: response.data?.name || "Pengguna",
        username: response.data?.username || null,
        profilePicture: response.data?.profilePicture || "./images/image.png",
      };
    } catch (error) {
      console.error("Error getting user data:", error);
      return null;
    }
  }

  async loadStoryDetail(storyId) {
    try {
      const response = await getStoryDetail(storyId);

      if (typeof response === "string" && response.startsWith("<!DOCTYPE")) {
        throw new Error("Server returned HTML instead of JSON");
      }

      if (!response || response.error) {
        const errorMsg = response?.message || "Failed to load story details";
        console.error("Error loading story detail:", errorMsg);
        this._view.showError("Gagal memuat detail story. Silakan coba lagi.");
        return;
      }

      const story = response.data;

      if (!story.isAnonymous && story.username) {
        const userData = await this.getCompleteUserData(story.username);
        story.profilePicture = userData?.profilePicture || "./images/image.png";
      } else {
        story.profilePicture = "./images/image.png";
      }

      if (story.comments && story.comments.length > 0) {
        for (const comment of story.comments) {
          if (comment.username) {
            const userData = await this.getCompleteUserData(comment.username);
            comment.profilePicture =
              userData?.profilePicture || "./images/image.png";
          } else {
            comment.profilePicture = "./images/image.png";
          }
        }
      }

      this._view.showStoryDetail(story);
    } catch (error) {
      console.error("Failed to load story detail:", error);
      this._view.showError("Terjadi kesalahan saat memuat detail story.");
    }
  }

  async getStoryById(storyId) {
    try {
      const response = await getStoryDetail(storyId);
      if (!response.error) {
        return response.data;
      }
      throw new Error(response.message || "Failed to get story");
    } catch (error) {
      console.error("Error getting story:", error);
      throw error;
    }
  }

  async likeStory(storyId) {
    try {
      if (!storyId) {
        throw new Error("Invalid story ID");
      }

      const response = await likeStory(storyId);

      const storyIndex = this._stories.findIndex(
        (story) => story.id === storyId || story._id === storyId
      );

      if (storyIndex !== -1) {
        this._stories[storyIndex].likeCount = response;
      }

      return response;
    } catch (error) {
      console.error("Failed to like story:", error);
      return null;
    }
  }

  async addComment(storyId, content) {
    try {
      if (!content || typeof content !== "string" || content.trim() === "") {
        throw new Error("Content is required");
      }

      const response = await commentOnStory(storyId, content);

      if (!response.error) {
        await this.loadStoryDetail(storyId);
        return true;
      } else {
        throw new Error(response.message || "Failed to post comment");
      }
    } catch (error) {
      console.error("Failed to post comment:", error);
      throw error;
    }
  }
}
