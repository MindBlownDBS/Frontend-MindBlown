import {
  getStories,
  postStory,
  likeStory,
  commentOnStory,
  getUserProfile,
  getStoryDetail,
  editStory,
  deleteStory,
  replyToComment,
  likeComment,
  deleteCommentApi,
  getCommentDetail,
} from "../../data/api";

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
          likeCount: story.likeCount,
          commentCount: story.comments?.length || 0,
        }));
        console.log("Stories loaded successfully:", this._stories);
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

      const apiResponse = await postStory(content, isAnonymous);

      if (apiResponse.error) {
        const errorMessage =
          apiResponse.message ||
          "Gagal mengunggah cerita. Respons server tidak valid.";
        console.error("Error posting story:", errorMessage, apiResponse);
        throw new Error(errorMessage);
      }

      const newStoryData = apiResponse.data;
      if (!newStoryData || (!newStoryData.id && !newStoryData._id)) {
        console.error(
          "API response for new story is missing a story ID in data.",
          apiResponse
        );
        throw new Error(
          "Cerita berhasil diunggah, namun ID cerita tidak diterima dari server."
        );
      }

      const newStory = {
        id: newStoryData._id || newStoryData.id,
        name: isAnonymous ? "Pengguna" : newStoryData.name,
        username: isAnonymous ? null : newStoryData.username,
        content: newStoryData.content,
        isAnonymous: newStoryData.isAnonymous,
        likes: newStoryData.likes || [],
        comments: newStoryData.comments || [],
        createdAt: newStoryData.createdAt,
        views: newStoryData.views || 0,
        likeCount: (newStoryData.likes || []).length,
        commentCount: (newStoryData.comments || []).length,
      };

      this._stories.unshift(newStory);
      this._view.showStories(this._stories);
      this._view.clearForm();

      document.dispatchEvent(
        new CustomEvent("storyDataChanged", {
          detail: { story: newStory, action: "posted" },
        })
      );

      return true;
    } catch (error) {
      console.error("Failed to post story:", error);

      if (error.message.includes("Content is required")) {
        alert("Content tidak boleh kosong");
      } else if (
        error.message.includes("Gagal mengunggah cerita") ||
        error.message.includes("ID cerita tidak diterima")
      ) {
        alert("Gagal mengunggah cerita: " + error.message);
      } else {
        alert("Terjadi kesalahan. Silakan coba lagi.");
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
      let currentStoryId = storyId;
      if (!currentStoryId || currentStoryId === "undefined") {
        const urlPath = window.location.hash;
        const urlMatch = urlPath.match(/#\/story\/([a-f0-9]+)/i);

        if (urlMatch && urlMatch[1]) {
          currentStoryId = urlMatch[1];
        } else {
          console.error(
            "Invalid story ID provided to loadStoryDetail:",
            currentStoryId
          );
          return;
        }
      }

      const response = await getStoryDetail(currentStoryId);

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
      story.likeCount = story.likes?.length || 0;
      story.commentCount = story.comments?.length || 0;

      if (!story.isAnonymous && story.username) {
        const userData = await this.getCompleteUserData(story.username);
        story.profilePicture = userData?.profilePicture || "./images/image.png";
        story.name = userData?.name || story.name;
      } else {
        story.profilePicture = "./images/image.png";
        story.name = "Pengguna";
      }

      if (story.comments && story.comments.length > 0) {
        for (const comment of story.comments) {
          comment.isCommentAnonymous = true;
          comment.authorActualUsername = null;

          if (comment.username) {
            const originalHandle = comment.username;
            comment.authorActualUsername = originalHandle;
            const commenterData = await this.getCompleteUserData(
              originalHandle
            );

            comment.profilePicture =
              commenterData?.profilePicture || "./images/image.png";
            comment.displayName = commenterData?.name || originalHandle;
            comment.handleName = `@${originalHandle}`;
            comment.isCommentAnonymous = false;
          } else {
            comment.profilePicture = "./images/image.png";
            comment.displayName = "Pengguna";
            comment.handleName = "Anonim";
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

      const responseData = await likeStory(storyId);

      if (responseData.error) {
        throw new Error(responseData.message || "Failed to like story");
      }

      return responseData;

      // const newLikeCount = Array.isArray(responseData.data?.likes)
      //   ? responseData.data.likes.length
      //   : typeof responseData.data === "number"
      //   ? responseData.data
      //   : 0;

      const storyIndex = this._stories.findIndex(
        (s) => s.id === storyId || s._id === storyId
      );
      if (storyIndex !== -1) {
        this._stories[storyIndex].likeCount = newLikeCount;
        if (Array.isArray(responseData.data?.likes))
          this._stories[storyIndex].likes = responseData.data.likes;
      }

      // document.dispatchEvent(
      //   new CustomEvent("storyDataChanged", {
      //     detail: {
      //       storyId,
      //       action: "liked",
      //       newLikeCount,
      //       likes: responseData.data?.likes,
      //     },
      //   })
      // );

      // return newLikeCount;
    } catch (error) {
      console.error("Failed to like story:", error);
      throw error;
    }
  }

  async addComment(storyId, content) {
    try {
      if (!content || typeof content !== "string" || content.trim() === "") {
        throw new Error("Content is required");
      }

      let currentStoryId = storyId;
      if (!currentStoryId || currentStoryId === "undefined") {
        const urlPath = window.location.hash;
        const urlMatch = urlPath.match(/#\/story\/([a-f0-9]+)/i);

        if (urlMatch && urlMatch[1]) {
          currentStoryId = urlMatch[1];
        } else {
          throw new Error("Invalid story ID");
        }
      }

      const response = await commentOnStory(currentStoryId, content);

      if (!response.error) {
        if (typeof this._view.showStoryDetail === "function") {
          await this.loadStoryDetail(currentStoryId);
        }

        document.dispatchEvent(
          new CustomEvent("storyDataChanged", {
            detail: {
              storyId: currentStoryId,
              action: "commented",
              newCommentId: response.commentId,
              currentCommentCount: response.commentCount,
              message: response.message,
            },
          })
        );
        return true;
      } else {
        throw new Error(response.message || "Failed to post comment");
      }
    } catch (error) {
      console.error("Failed to post comment in addComment:", error);
      throw error;
    }
  }

  async loadCommentDetail(commentId) {
    try {
      if (
        !commentId ||
        typeof commentId !== "string" ||
        commentId.trim() === ""
      ) {
        console.error(
          "StoryPresenter: Attempted to load comment detail with invalid ID:",
          commentId
        );
        this._view.showError("ID komentar tidak valid untuk dimuat.");
        return;
      }
      const response = await getCommentDetail(commentId);

      if (!response.error && response.data) {
        this._view.showCommentDetail(response.data);
      } else {
        console.error(
          "Error loading comment detail in presenter:",
          response.message
        );
        this._view.showError(
          response.message || "Gagal memuat detail komentar."
        );
      }
    } catch (error) {
      console.error(
        "Failed to load comment detail in presenter (exception):",
        error
      );
      this._view.showError(
        error.message || "Terjadi kesalahan saat memuat detail komentar."
      );
    }
  }

  async addReplyToComment(parentCommentId, content) {
    try {
      if (!content || typeof content !== "string" || content.trim() === "") {
        throw new Error("Konten balasan tidak boleh kosong");
      }
      const response = await replyToComment(parentCommentId, content.trim());
      if (response.error) {
        throw new Error(response.message || "Gagal menambahkan balasan.");
      }
      document.dispatchEvent(
        new CustomEvent("commentDataChanged", {
          detail: {
            action: "replied",
            parentId: parentCommentId,
            replyId: response.replyId,
          },
        })
      );
      return response;
    } catch (error) {
      console.error("Failed to add reply:", error);
      throw error;
    }
  }

  async likeExistingComment(commentId) {
    try {
      const response = await likeComment(commentId);
      if (response.error) {
        throw new Error(response.message || "Gagal menyukai komentar.");
      }
      document.dispatchEvent(
        new CustomEvent("commentDataChanged", {
          detail: {
            action: "commentLiked",
            entityId: commentId,
            newLikeCount: response.likeCount,
            message: response.message,
          },
        })
      );
      return response;
    } catch (error) {
      console.error("Failed to like comment:", error);
      throw error;
    }
  }

  async deleteExistingComment(commentId) {
    try {
      const response = await deleteCommentApi(commentId);
      if (response.error) {
        throw new Error(response.message || "Gagal menghapus komentar.");
      }
      document.dispatchEvent(
        new CustomEvent("commentDataChanged", {
          detail: {
            action: "commentDeleted",
            entityId: commentId,
          },
        })
      );
      return response;
    } catch (error) {
      console.error("Failed to delete comment:", error);
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

      const storyIndex = this._stories.findIndex(
        (s) => s.id === storyId || s._id === storyId
      );
      if (storyIndex !== -1) {
        this._stories[storyIndex] = {
          ...this._stories[storyIndex],
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
      console.error("Failed to edit story:", error);
      throw error;
    }
  }

  async deleteStory(storyId) {
    try {
      const response = await deleteStory(storyId);

      if (response.error) {
        throw new Error(response.message);
      }

      this._stories = this._stories.filter(
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
      console.error("Failed to delete story:", error);
      throw error;
    }
  }
}
