export function mindTrackerModalTemplate() {
  return `
    <div id="mindTrackerModal" class="fixed inset-0 items-center justify-center bg-black/40 z-50 hidden">
        <div class="bg-white rounded-lg shadow-lg p-6 md:w-lg lg:w-full lg:max-w-lg">
            <div class="flex justify-between items-center mb-4">
                <h3 id="modalTitle" class="text-lg font-semibold">Mind Tracker</h3>
                <button id="closeModalBtn" class="text-gray-400 hover:text-gray-600 text-3xl">&times;</button>
            </div>
            <hr class="my-4 text-gray-300">
            <form id="mindTrackerForm">
                <div class="text-center mb-4">
                    <p class="text-sm my-4">Perasaanmu Hari ini</p>
                    <div class="flex justify-center space-x-6 mb-2 gap-15">
                        <label class="flex flex-col gap-3 cursor-pointer">
                            <input type="radio" name="mood" value="buruk" class="hidden peer" required>
                            <span class="text-3xl peer-checked:scale-125 transition">😞</span>
                            <div class="text-xs">Buruk</div>
                        </label>
                        <label class="flex flex-col gap-3 cursor-pointer">
                            <input type="radio" name="mood" value="oke" class="hidden peer" required>
                            <span class="text-3xl peer-checked:scale-125 transition">🙂</span>
                            <div class="text-xs">Oke</div>
                        </label>
                        <label class="flex flex-col gap-3 cursor-pointer">
                            <input type="radio" name="mood" value="sempurna" class="hidden peer" required>
                            <span class="text-3xl peer-checked:scale-125 transition">🥳</span>
                            <div class="text-xs">Sempurna</div>
                        </label>
                    </div>
                    <p class="mb-4 mt-8">Progres kamu</p>
                    <textarea name="progress" class="w-full border p-2 rounded-xl overflow-hidden" rows="3" placeholder="Ceritakan bagaimana harimu dan perasaanmu sekarang" required ${
                      isViewMode ? "readonly" : ""
                    }></textarea>
                </div>
                ${
                  !isViewMode
                    ? `
                <div id="submit-mind-tracker" class="flex justify-end">
                    <button type="submit" class="w-25 bg-third text-white py-2 rounded-lg mt-2 justify-end">Kirim</button>
                </div>
                `
                    : ""
                }
            </form>
        </div>
    </div>
    `;
}

export function userChatBubble(text) {
  return `
        <div class="flex justify-end mb-3">
            <div class="flex flex-row-reverse items-start gap-2 max-w-[80%]">
                <div class="bg-[#7de3e1] px-4 py-2 rounded-lg text-sm text-gray-800 text-left">
                    ${text}
                </div>
            </div>
        </div>
    `;
}

export function botChatBubble(text) {
  return `
        <div class="flex justify-start mb-3">
            <div class="flex items-start max-w-[80%]">
                <div class="w-6 h-6 rounded-lg bg-white flex items-center justify-center">
                    <img src="images/logo.png" alt="Bot" class="w-8 h-8 object-cover">
                </div>
                <div class="bg-white px-3 py-2 rounded-lg text-sm text-gray-800">
                    ${text}
                </div>
            </div>
        </div>
    `;
}

// ... existing code ...

export function notificationItemTemplate({
  icon = "images/logo.png",
  title = "",
  message = "",
}) {
  return `
        <div class="flex items-start gap-3 py-4 border-b border-gray-200">
            <div class="w-8 h-8 flex-shrink-0 flex items-center justify-center">
                <img src="${icon}" alt="icon" class="w-7 h-7 object-cover">
            </div>
            <div class="text-left">
                <div class="font-semibold text-base text-gray-800 mb-1">${title}</div>
                <div class="text-sm text-gray-700 leading-snug">${message}</div>
            </div>
        </div>
    `;
}

export function weeklyMoodTrackerTemplate(moods) {
  const pointGap = 200;
  const emojiY = [40, 10, 60, 35, 50, 25, 45, 0];
  const width = (moods.length - 1) * pointGap + 40;
  const height = 80;

  const points = moods
    .map((_, i) => {
      const x = 20 + i * pointGap;
      const y = emojiY[i] || 40;
      return `${x},${y}`;
    })
    .join(" ");

  return `
      <div class="bg-white rounded-xl border border-gray-200 p-4 mt-6 mb-8">
        <div class="flex items-center justify-between">
          <button class="rounded-full border border-gray-300 w-8 h-8 flex items-center justify-center text-gray-500 hover:bg-gray-100" id="moodPrevBtn">
            &larr;
          </button>
          <div class="flex-1 flex flex-col items-center">
            <div style="position:relative; width:${width}px; height:${
    height + 40
  }px;">
              <svg width="${width}" height="${height}" style="position:absolute;top:0;left:0;">
                <polyline
                  fill="none"
                  stroke="#bbb"
                  stroke-width="2"
                  points="${desktopPoints}"
                />
              </svg>
              ${moods
                .map((mood, i) => {
                  const x = 20 + i * pointGap;
                  const y = emojiY[i] || 40;
                  return `
                  <div style="position:absolute;left:${x - 18}px;top:${
                    y - 18
                  }px;width:36px;height:36px;display:flex;flex-direction:column;align-items:center;">
                    <span style="font-size:2rem;line-height:1;">${
                      mood.emoji
                    }</span>
                  </div>
                  <div style="position:absolute;left:${x - 30}px;top:${
                    height + 5
                  }px;width:60px;text-align:center;font-size:12px;color:#666;">
                    ${mood.date}
                  </div>
                `;
                })
                .join("")}
            </div>

            <!-- Mobile View -->
            <div class="lg:hidden" style="position:relative; width:${mobileWidth}px; height:${
    height + 40
  }px;">
              <svg width="${mobileWidth}" height="${height}" style="position:absolute;top:0;left:0;">
                <polyline
                  fill="none"
                  stroke="#bbb"
                  stroke-width="2"
                  points="${mobilePoints}"
                />
              </svg>
              ${moods
                .slice(0, 4)
                .map((mood, i) => {
                  const x = 20 + i * mobilePointGap;
                  const y = emojiY[i] || 40;
                  return `
                  <div style="position:absolute;left:${x - 18}px;top:${
                    y - 18
                  }px;width:36px;height:36px;display:flex;flex-direction:column;align-items:center;">
                    <span style="font-size:1.5rem;line-height:1;">${
                      mood.emoji
                    }</span>
                  </div>
                  <div style="position:absolute;left:${x - 30}px;top:${
                    height + 5
                  }px;width:60px;text-align:center;font-size:12px;color:#666;">
                    ${mood.date}
                  </div>
                `;
                })
                .join("")}
            </div>
          </div>
          <button class="rounded-full border border-gray-300 w-8 h-8 flex items-center justify-center text-gray-500 hover:bg-gray-100" id="moodNextBtn">
            &rarr;
          </button>
        </div>
      </div>
    `;
}

export function notificationListTemplate(notifications) {
  return `
        <div class="max-w-xl w-full ml-24 text-left">
            <h1 class="text-2xl font-semibold mb-8 mt-3">Pemberitahuan</h1>
            <div>
                ${notifications.map(notificationItemTemplate).join("")}
            </div>
        </div>
    `;
}

export function profileTemplate(userData) {
  return `
    <div class="ml-16 min-h-screen p-10">
    <div class="max-w">
      <h1 class="text-2xl font-semibold text-gray-900 mb-10">Profil</h1>
          
      <div class="mt-8">
      <div class="flex items-center justify-between mb-8">
        <div class="flex items-center gap-4">
        <div class="w-24 h-24 rounded-full overflow-hidden">
          <img src="${
            userData.profilePicture || "/images/image.png"
          }" alt="Foto Profil" class="w-full h-full object-cover">
        </div>
        <div>
          <div class="text-lg font-medium">${
            userData.name || "Nama Pengguna"
          }</div>
        <div class="text-gray-500">@${userData.username || "namapengguna"}</div>
      </div>
      </div>
                
      <div class="flex gap-4">
        <button id="editProfileBtn" class="w-25 border border-primary rounded-lg text-primary mt-2 justify-end">Sunting</button>
        <button id="logoutBtn" class="w-25 bg-red-300 text-white py-2 rounded-lg mt-2 justify-end">Keluar</button>
        </div>
        </div>
      </div>

      <hr class="my-4 border-gray-300">

      <div class="bg-none">
        <h2 class="text-lg font-medium mb-4">Unggahan</h2>
        <div id="user-stories-container" class="mt-6">
        <p class="text-gray-500 text-center py-8">Belum ada unggahan</p>
        </div>
        </div>
        </div>
    </div>
  `;
}

export function editProfileModalTemplate(userData) {
  return `
    <div id="editProfileModal" class="fixed inset-0 items-center justify-center bg-black/40 z-50 hidden">
    <div class="bg-white rounded-lg shadow-lg p-6 w-full max-w-md">
    <div class="flex justify-between items-center mb-4">
        <h3 class="text-lg font-semibold">Edit Profil</h3>
        <button id="closeEditProfileModalBtn" class="text-gray-400 hover:text-gray-600 text-3xl">&times;</button>
        </div>
      <hr class="my-4 border-gray-300">
        
      <form id="editProfileForm" class="space-y-4">
      <div>
        <label class="block text-sm font-medium text-gray-700 mb-1">Nama Lengkap</label>
        <input type="text" name="name" value="${userData.name || ""}" 
        class="w-full border border-gray-300 rounded-lg p-2">
      </div>
          
      <div>
        <label class="block text-sm font-medium text-gray-700 mb-1">Username</label>
        <input type="text" name="username" value="${userData.username || ""}" 
        class="w-full border border-gray-300 rounded-lg p-2">
        </div>
          
      <div>
      <label class="block text-sm font-medium text-gray-700 mb-1">Foto Profil</label>
      <div class="flex items-center gap-4">
        <div class="w-16 h-16 rounded-full overflow-hidden border border-gray-300">
          <img id="profileImagePreview" src="${
            userData.profilePicture || "/images/image.png"
          }" 
          alt="Preview Foto Profil" class="w-full h-full object-cover">
          </div>
          <input type="file" id="profilePictureInput" accept="image/*" class="hidden">
          <button type="button" id="changePhotoBtn" 
            class="text-sm text-primary border border-primary rounded-lg px-3 py-1">
            Ganti Foto
        </button>
      </div>
      </div>
          
      <div class="flex justify-end gap-3 pt-4">
      <button type="button" id="cancelEditBtn" 
        class="w-25 border border-gray-300 py-2 rounded-lg mt-2 justify-end text-gray-700">Batal</button>
        <button type="submit" class="w-25 bg-third text-white py-2 rounded-lg mt-2 justify-end">Simpan</button>
        </div>
        </form>
      </div>
    </div>
  `;
}

export function storyItemTemplate({
  username = "Pengguna",
  handle = "Anonim",
  content = "",
  isAnonymous = true,
  likeCount = 0,
  commentCount = 0,
  viewCount = 0,
  storyId = "",
  profilePicture = "./images/image.png",
}) {
  return `
    <div class="story-container flex items-start gap-3 py-3 border-b border-gray-200 max-w-2xl" data-story-id="${storyId}">
      <div class="w-10 h-10 flex-shrink-0 user-info">
        <img src="${profilePicture}" alt="icon" class="w-10 h-10 object-cover rounded-full" />
      </div>

      <div class="flex flex-col text-left story-content">
        <div class="user-info">
          <div class="font-semibold text-base text-gray-800">${username}</div>
          <div class="text-sm text-gray-500">${handle}</div>
          </div>
          <p class="text-gray-700 mt-3 text-sm leading-relaxed">${content}</p>

        <div class="flex items-center gap-30 mt-3">
        <button class="like-btn flex items-center gap-1" data-story-id="${storyId}">
            <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M20.84 4.61a5.5 5.5 0 0 0-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 0 0-7.78 7.78l1.06 1.06L12 21.23l7.78-7.78 1.06-1.06a5.5 5.5 0 0 0 0-7.78z"></path></svg>
            <span class="like-count text-sm">${likeCount}</span>
          </button>
          <button class="comment-btn flex items-center gap-1" data-story-id="${storyId}">
            <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M21 11.5a8.38 8.38 0 0 1-.9 3.8 8.5 8.5 0 0 1-7.6 4.7 8.38 8.38 0 0 1-3.8-.9L3 21l1.9-5.7a8.38 8.38 0 0 1-.9-3.8 8.5 8.5 0 0 1 4.7-7.6 8.38 8.38 0 0 1 3.8-.9h.5a8.48 8.48 0 0 1 8 8v.5z"></path></svg>
            <span class="comment-count text-sm">${commentCount}</span>
          </button>
          <button class="view-btn flex items-center gap-1" data-story-id="${storyId}">
            <svg xmlns="http://www.w3.org/2000/svg" class="w-6 h-6 flex-shrink-0  height="24" viewBox="0 0 24 24" width="24"><path d="M0 0h24v24H0V0z" fill="none"/><path d="M8 17c-.55 0-1-.45-1-1v-5c0-.55.45-1 1-1s1 .45 1 1v5c0 .55-.45 1-1 1zm4 0c-.55 0-1-.45-1-1V8c0-.55.45-1 1-1s1 .45 1 1v8c0 .55-.45 1-1 1zm4 0c-.55 0-1-.45-1-1v-2c0-.55.45-1 1-1s1 .45 1 1v2c0 .55-.45 1-1 1zm2 2H6c-.55 0-1-.45-1-1V6c0-.55.45-1 1-1h12c.55 0 1 .45 1 1v12c0 .55-.45 1-1 1zm1-16H5c-1.1 0-2 .9-2 2v14c0 1.1.9 2 2 2h14c1.1 0 2-.9 2-2V5c0-1.1-.9-2-2-2z"/></svg>
            <span class="view-count text-sm">${viewCount}</span>
          </button>
          </div>
      </div>
    </div>
  `;
}

export function storyFormTemplate({
  username = "Nama Pengguna",
  handle = "@namapengguna",
  profilePicture = "./images/image.png",
} = {}) {
  return `
    <form id="chat-form" class="mt-auto sticky">
    <div class="flex items-start gap-3 py-4 border-gray-200 max-w-2xl">
    <div class="w-10 h-10 flex-shrink-0">
        <img src="${profilePicture}" alt="icon" class="w-10 h-10 object-cover rounded-full" />
      </div>

      <div class="flex flex-col text-left w-full">
      <div>
        <div class="font-semibold text-base text-gray-800">${username}</div>
        <div class="text-sm text-gray-500 mb-4">${handle}</div>
      </div>
      <div class="relative w-full z-50 w-full max-w-2xl mx-auto">
        <textarea 
          id="chat-input"
          class="text-[#8c8c8c] w-full h-24 px-4 py-3 pr-14 rounded-3xl border border-gray-300 focus:outline-none focus:ring-2 focus:ring-teal-500 focus:border-transparent overflow-hidden"
          placeholder="Ada cerita apa?..."></textarea>
        <button class="absolute right-3 top-1/2 transform -translate-y-1/2 rounded-full bg-[#eee] p-2 w-25 text-white py-2 mt-2 hover:bg-teal-500 justify-end" type="submit">Unggah</button>
      </div>
      <div class="mt-2 flex items-center">
        <input type="checkbox" id="post-anonymously" class="mr-2">
        <label for="post-anonymously" class="text-sm text-gray-600">Unggah sebagai anonim</label>
      </div>
    </div>
    </form>
  `;
}

export function commentFormTemplate({
  username = "Nama Pengguna",
  handle = "@namapengguna",
  profilePicture = "./images/image.png",
} = {}) {
  return `
    <form id="comment-form" class="sticky top-4">
      <div class="flex items-start gap-3 py-4 border-gray-200 max-w-2xl">
        <div class="w-10 h-10 flex-shrink-0">
          <img src="${profilePicture}" alt="icon" class="w-10 h-10 object-cover rounded-full" />
        </div>

        <div class="flex flex-col text-left w-full">
          <div>
            <div class="font-semibold text-base text-gray-800">${username}</div>
            <div class="text-sm text-gray-500 mb-4">${handle}</div>
          </div>
          <div class="relative w-full z-50">
            <textarea 
              id="comment-input"
              class="text-[#8c8c8c] w-full h-24 px-4 py-3 pr-14 rounded-3xl border border-gray-300 focus:outline-none focus:ring-2 focus:ring-teal-500 focus:border-transparent overflow-hidden"
              placeholder="Tulis komentar Anda..."></textarea>
            <button class="absolute right-3 top-1/2 transform -translate-y-1/2 rounded-full bg-[#eee] p-2 w-25 text-white py-2 mt-2 hover:bg-teal-500 justify-end" type="submit">Unggah</button>
          </div>
        </div>
      </div>
    </form>
  `;
}

export function commentItemTemplate({
  username = "Pengguna",
  content = "",
  timestamp = "",
  profilePicture = "./images/image.png",
} = {}) {
  const date = new Date(timestamp);
  const formattedDate = date.toLocaleDateString("id-ID", {
    day: "numeric",
    month: "long",
    year: "numeric",
  });

  return `
    <div class="comment-container flex items-start gap-3 py-3 border-b border-gray-200">
      <div class="w-10 h-10 flex-shrink-0">
        <img src="${profilePicture}" alt="icon" class="w-10 h-10 object-cover rounded-full" />
      </div>

      <div class="flex flex-col text-left">
        <div class="font-semibold text-base text-gray-800">${username}</div>
        <p class="text-gray-700 mt-1 text-sm leading-relaxed">${content}</p>
        <div class="text-xs text-gray-500 mt-1">${formattedDate}</div>
      </div>
    </div>
  `;
}
