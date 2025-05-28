import { storyFormTemplate, storyItemTemplate } from "../templates";
import StoryPresenter from "./story-presenter";

export default class StoryDetailPage {
  constructor(storyId) {
    this._storyId = storyId;
    this._presenter = new StoryPresenter(this);
  }

  async render() {
    const currentUser = this._presenter.getCurrentUser();
    const username = currentUser?.name || "Nama Pengguna";
    const handle = currentUser?.username
      ? `@${currentUser.username}`
      : "@namapengguna";

    return `
    <div class="ml-16 min-h-screen p-10">
      <div class="mb-1">
        <h1 class="text-2xl font-semibold text-gray-900 mb-2">Detail Story</h1>
        <p class="text-gray-600">Cerita lengkap dan komentar.</p>
        <hr class="mt-4 text-gray-300">
      </div>

      <div class="grid grid-cols-2 gap-4 h-screen">
        <div class="overflow-y-auto p-6 mr-10 border-gray-200">
          <div id="story-detail-container" class="space-y-6"></div>
          <div id="comments-container" class="mt-8 space-y-6">
            <h3 class="text-lg font-semibold text-gray-900">Komentar</h3>
          </div>
        </div>

        <div class="p-6">
          <div class="fixed space-y-6 ml-10 mt-4">
            ${storyFormTemplate({ username, handle })}
          </div>
        </div>
      </div>
    </div>
    `;
  }

  async afterRender() {
    await this._presenter.loadStoryDetail(this._storyId);
    this.setupEventListeners();
  }

  showStoryDetail(story) {
    const container = document.getElementById("story-detail-container");
    if (container) {
      container.innerHTML = storyItemTemplate({
        username: story.isAnonymous ? "Pengguna" : story.name,
        handle: story.isAnonymous ? "Anonim" : `@${story.username}`,
        content: story.content,
        isAnonymous: story.isAnonymous,
        likeCount: story.likeCount,
        commentCount: story.commentCount,
        viewCount: story.viewCount,
        storyId: story._id,
      });
    }
  }

  setupEventListeners() {}
}
