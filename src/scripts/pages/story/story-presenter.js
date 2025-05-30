import {
  getStories,
  postStory,
  likeStory,
  commentOnStory,
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
        this._stories = response.data || [];
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
          name: response.data.name,
          username: response.data.username,
          content: response.data.content,
          isAnonymous: response.data.isAnonymous,
          likeCount: response.data.likes?.length || 0,
          commentCount: response.data.comments?.length || 0,
          viewCount: 0, //Ini di apinya ada gak siie?
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

  async loadStoryDetail(storyId) {
    try {
      const response = await getStoryDetail(storyId);
      if (!response.error) {
        this._view.showStoryDetail(response.data);
      } else {
        console.error("Error loading story detail:", response.message);
      }
    } catch (error) {
      console.error("Failed to load story detail:", error);
    }
  }

  async likeStory(storyId) {
    try {
      if (!storyId) {
        throw new Error("Invalid story ID");
      }

      const response = await likeStory(storyId);
      
      const storyIndex = this._stories.findIndex(story => 
        story.id === storyId || story._id === storyId
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
      if (!storyId) {
        console.error("Invalid story ID for commenting");
        return null;
      }

      const response = await commentOnStory(storyId, content);
      
      if (response.error) {
        console.error("Error adding comment:", response.message);
        return null;
      }
      
      return response.commentCount || response.comments?.length || null;
    } catch (error) {
      console.error("Failed to add comment:", error);
      return null;
    }
  }
}
