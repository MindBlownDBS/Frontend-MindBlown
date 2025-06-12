import { formatTimeAgo } from "../utils";

export function mindTrackerModalTemplate(isViewMode = true, selectedMood = '') {
   const moods = [
    { value: 'sadness', emoji: '😞', label: 'Sedih' },
    { value: 'neutral', emoji: '😐', label: 'Netral' },
    { value: 'joy', emoji: '😊', label: 'Senang' },
    { value: 'anger', emoji: '😠', label: 'Marah' }
  ];

  const selectedMoodObj = moods.find(m => m.value === selectedMood) || {};
  const moodEmoji = selectedMoodObj.emoji || '';
  const moodLabel = selectedMoodObj.label || '';

  return `
    <div id="mindTrackerModal" class="fixed inset-0 items-center justify-center bg-black/40 z-50 hidden ">
        <div class="bg-white rounded-lg shadow-lg p-6 w-[90%] md:w-lg lg:w-full lg:max-w-lg">
            <div class="flex justify-between items-center mb-4">
                <h3 id="modalTitle" class="text-lg font-semibold">Mind Tracker</h3>
                <button id="closeModalBtn" class="text-gray-400 hover:text-gray-600 text-3xl">&times;</button>
            </div>
            <hr class="my-4 text-gray-300">
            <form id="mindTrackerForm">
                <div class="text-center mb-4">
                    ${isViewMode && selectedMood ? `
                        <p class="text-md my-4">Perasaanmu Terdeteksi</p>
                        <div class="flex justify-center mb-2">
                            <div class="flex flex-col items-center">
                                <span class="text-4xl">${moodEmoji}</span>
                                <div class="text-sm mt-2">${moodLabel}</div>
                            </div>
                        </div>
                    ` : isViewMode ? `
                        <p class="text-md my-4">Belum ada data mood</p>
                    ` : `
                        <p class="text-md my-4">Perasaanmu Hari ini</p>
                        <p class="text-xs text-gray-500 mb-4">(Akan terdeteksi otomatis dari teks yang kamu tulis)</p>
                    `}

                    <p class="mb-4 mt-8">Progres kamu</p>
                    <textarea name="progress" class="w-full border p-2 rounded-xl overflow-hidden" rows="3" placeholder="Ceritakan bagaimana harimu dan perasaanmu sekarang" required ${
                      isViewMode ? "readonly" : ""
                    }></textarea>
                </div>
                ${
                  !isViewMode
                    ? `
                <div id="submit-mind-tracker" class="flex justify-end">
                    <button type="submit" class="w-30 bg-third text-white py-2 px-4 rounded-lg mt-2 justify-end text-xs lg:text-sm">Kirim</button>
                </div>
                `
                    : ""
                }
            </form>
        </div>
    </div>
    `;
}

export const loginModalTemplate = () => `
    <div class="bg-white rounded-lg p-8 max-w-md w-full mx-4">
        <h2 class="text-2xl font-semibold mb-4">Login Diperlukan</h2>
        <p class="text-gray-600 mb-6">Silakan login untuk mengakses fitur ini.</p>
        <div class="flex justify-end gap-4">
            <button id="cancel-login" class="px-4 py-2 text-gray-600 hover:text-gray-800">Batal</button>
            <button id="go-to-login" class="px-4 py-2 bg-third text-white rounded-lg hover:bg-third/80">Login</button>
        </div>
    </div>
`;

export const welcomeModalTemplate = () => `
  <div class="fixed inset-0 bg-black/70 flex items-center justify-center z-50">
    <div class="bg-white rounded-xl p-8 max-w-md w-full mx-4 text-center">
      <h2 class="text-2xl font-semibold mb-2">Selamat Datang</h2>
      <p class="text-gray-600 mb-5 text-sm">
         Masuk atau daftar untuk menikmati lebih banyak fitur unggulan dari kami ...
      </p>
      <button id="welcome-login" class="w-full py-2 mb-3 rounded-full bg-third text-white font-semibold border-2 border-third hover:bg-third/80 transition">Log in</button>
      <button id="welcome-signup" class="w-full py-2 mb-3 rounded-full border-2 border-third text-black font-semibold hover:bg-gray-100 transition">Sign up</button>
      <a href="#" id="welcome-stay-logged-out" class="text-gray-500 underline text-sm">Lewati untuk sekarang</a>
    </div>
  </div>
`;

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
            <div class="flex items-start gap-2 max-w-[90%] lg:max-w-[80%]">
                <div class="w-6 h-6 rounded-full bg-gray-100 flex items-center justify-center flex-shrink-0">
                    <img src="images/logo.png" alt="MindBlown" class="w-4 h-4 object-contain">
                </div>
                <div class="bg-white px-3 py-2 rounded-lg text-xs lg:text-sm text-gray-800 text-left">
                    ${text}
                </div>
            </div>
        </div>
    `;
}

export function weeklyMoodTrackerGridTemplate(data = {}) {
  const isMonthlyData = data.monthRange && data.entries;
  const range = data.weekRange || data.monthRange || {};
  const entries = data.entries || [];

  if (!entries || entries.length === 0) {
    return `
      <div class="bg-white rounded-xl border border-gray-200 p-4 mt-6 mb-8">
        <div class="text-center py-4 text-gray-500">
          <p>Belum ada data mood tracker untuk ${isMonthlyData ? 'bulan' : 'minggu'} ini.</p>
        </div>
      </div>
    `;
  }

  let dateRangeDisplay;
  if (isMonthlyData && range.month) {
    dateRangeDisplay = range.month;
  } else if (range.start && range.end) {
    const startParts = range.start.split('-');
    const endParts = range.end.split('-');
    dateRangeDisplay = `${startParts[2]}/${startParts[1]} - ${endParts[2]}/${endParts[1]}/${endParts[0]}`;
  } else {
    dateRangeDisplay = "Data periode ini";
  }
  
  const desktopVisibleDays = 7;
  const mobileVisibleDays = 3;
  const desktopPointGap = 100; 
  const mobilePointGap = 60;    
  const height = 80;
  
  const entriesWithData = entries.filter(entry => entry.hasEntry);
  const hasEntries = entriesWithData.length > 0;
  
  const emojiY = entries.map(entry => {
    if (!entry.hasEntry) return 40; 
    
    if (!entry.mood) return 45;
    
    const moodPositions = {
      'joy': 20,
      'neutral': 45,
      'sadness': 60,
      'anger': 60
    };
    
    return moodPositions[entry.mood] || 45;
  });
  
  const desktopTotalSlides = Math.ceil(entries.length / desktopVisibleDays);
  const mobileTotalSlides = Math.ceil(entries.length / mobileVisibleDays);
  
 
  const desktopWidth = (desktopVisibleDays - 1) * desktopPointGap + 100;
  
  const fullDesktopWidth = entries.length > 1 
    ? (entries.length - 1) * desktopPointGap + 150
    : 150;
  
  const mobileWidth = (mobileVisibleDays - 1) * mobilePointGap + 80;
  const fullMobileWidth = entries.length > 1
    ? (entries.length - 1) * mobilePointGap + 90
    : 90; 
  
  if (!hasEntries) {
    return `
      <div class="bg-white rounded-xl border border-gray-200 p-4 mt-6 mb-8">
        <div class="text-center py-4 text-gray-500">
           <p>Belum ada data mood yang direkam ${isMonthlyData ? 'bulan' : 'minggu'} ini.</p>
          <p class="text-xs mt-1">Rekam mood harianmu untuk melihat grafik.</p>
        </div>
      </div>
    `;
  }
  
  return `
    <div class="bg-white rounded-xl border border-gray-200 p-4 mt-6 mb-8">
      <div class="mb-2">
        
      </div>
      
      <div class="flex items-center justify-between">
        <button class="rounded-full border border-gray-300 w-8 h-8 flex items-center justify-center text-gray-500 hover:bg-gray-100" id="moodPrevBtn" aria-label="Sebelumnya">
          &larr;
        </button>
        
        <div class="flex-1 hidden lg:block overflow-hidden">
          <div class="mood-desktop-carousel relative w-full" style="height:${height + 40}px;">
            <div class="mood-desktop-carousel-inner" style="position:relative; width:${desktopWidth}px; height:${height + 40}px; margin:0 auto; overflow:hidden;">
              <div class="mood-desktop-carousel-slides" style="position:absolute; top:0; left:0; width:${fullDesktopWidth}px; height:${height + 40}px; transition: transform 0.3s ease;">
                
                ${entries.filter(entry => entry.hasEntry).length > 0 ? `
                <svg width="${fullDesktopWidth}" height="${height}" style="position:absolute;top:0;left:0;">
                  <polyline
                    fill="none"
                    stroke="#333"
                    stroke-width="2"
                    points="${entries
                      .filter(entry => entry.hasEntry)
                      .map((entry, i) => {
                        const entryIndex = entries.findIndex(e => e.date === entry.date);
                        const x = 20 + entryIndex * desktopPointGap;
                        const y = emojiY[entryIndex];
                        return `${x},${y}`;
                      })
                      .join(" ")}"
                  />
                </svg>
                ` : ''}
                
                ${entries.map((entry, i) => {
                  const date = new Date(entry.date);
                  const dayName = date.toLocaleDateString('id-ID', { weekday: 'short' });
                  const dayNumber = date.getDate();
                  const monthName = date.toLocaleDateString('id-ID', { month: 'short' });
                  const dayLabel = `${dayName}, ${dayNumber} ${monthName}`;
                  
                  const x = 20 + (i * desktopPointGap);
                  const y = emojiY[i];
                  
                  let emoji = '❓';
                  let clickableClass = '';
                  
                  if (entry.hasEntry) {
                    emoji = entry.mood ? getMoodEmoji(entry.mood) : '📝';
                    clickableClass = 'cursor-pointer';
                  }
                  
                  return `
                    <div style="position:absolute;left:${x - 18}px;top:${y - 18}px;width:36px;height:36px;display:flex;flex-direction:column;align-items:center;"
                        class="${clickableClass}" 
                        data-date="${entry.date}" 
                        data-mood="${entry.mood || ''}"
                        data-progress="${entry.progress || ''}">
                      <span style="font-size:2rem;line-height:1;">${emoji}</span>
                    </div>
                    <div style="position:absolute;left:${x - 30}px;top:${height + 5}px;width:60px;text-align:center;font-size:10px;color:#666;">
                      ${dayLabel}
                    </div>
                  `;
                }).join('')}
              </div>
              
              <div class="absolute bottom-0 left-0 right-0 flex justify-center gap-1 pt-1">
                ${Array.from({ length: desktopTotalSlides }).map((_, i) => 
                  `<span class="desktop-carousel-dot w-1.5 h-1.5 rounded-full bg-gray-300 ${i === 0 ? 'active bg-third' : ''}" data-index="${i}"></span>`
                ).join('')}
              </div>
            </div>
          </div>
        </div>

        <div class="flex-1 lg:hidden">
          <div class="mood-mobile-carousel relative w-full" style="height:${height + 40}px;">
            <div class="mood-mobile-carousel-inner" style="position:relative; width:${mobileWidth}px; height:${height + 40}px; margin:0 auto; overflow:hidden;">
              <div class="mood-mobile-carousel-slides" style="position:absolute; top:0; left:0; width:${fullMobileWidth}px; height:${height + 40}px; transition: transform 0.3s ease;">
                ${entries.filter(entry => entry.hasEntry).length > 0 ? `
                <svg width="${fullMobileWidth}" height="${height}" style="position:absolute;top:0;left:0;">
                  <polyline
                    fill="none"
                    stroke="#333"
                    stroke-width="2"
                    points="${entries
                      .filter(entry => entry.hasEntry)
                      .map((entry, i) => {
                        const entryIndex = entries.findIndex(e => e.date === entry.date);
                        const x = 20 + entryIndex * mobilePointGap;
                        const y = emojiY[entryIndex];
                        return `${x},${y}`;
                      })
                      .join(" ")}"
                  />
                </svg>
                ` : ''}
                
                ${entries.map((entry, i) => {
                  const date = new Date(entry.date);
                  const dayName = date.toLocaleDateString('id-ID', { weekday: 'short' });
                  const dayNumber = date.getDate();
                  const monthName = date.toLocaleDateString('id-ID', { month: 'short' });
                  const dayLabel = `${dayName}, ${dayNumber} ${monthName.slice(0,3)}`;
                  
                  const x = 20 + (i * mobilePointGap);
                  const y = emojiY[i];
                  
                  let emoji = '❓';
                  let clickableClass = '';
                  
                  if (entry.hasEntry) {
                    emoji = entry.mood ? getMoodEmoji(entry.mood) : '📝';
                    clickableClass = 'cursor-pointer';
                  }
                  
                  return `
                    <div style="position:absolute;left:${x - 18}px;top:${y - 18}px;width:36px;height:36px;display:flex;flex-direction:column;align-items:center;"
                        class="${clickableClass}" 
                        data-date="${entry.date}" 
                        data-mood="${entry.mood || ''}"
                        data-progress="${entry.progress || ''}">
                      <span style="font-size:1.5rem;line-height:1;">${emoji}</span>
                    </div>
                    <div style="position:absolute;left:${x - 30}px;top:${height + 5}px;width:60px;text-align:center;font-size:9px;color:#666;">
                      ${dayLabel}
                    </div>
                  `;
                }).join('')}
              </div>
              
              <div class="absolute bottom-0 left-0 right-0 flex justify-center gap-1 pt-1">
                ${Array.from({ length: mobileTotalSlides }).map((_, i) => 
                  `<span class="mobile-carousel-dot w-1.5 h-1.5 rounded-full bg-gray-300 ${i === 0 ? 'active bg-third' : ''}" data-index="${i}"></span>`
                ).join('')}
              </div>
            </div>
          </div>
        </div>
        
        <button class="rounded-full border border-gray-300 w-8 h-8 flex items-center justify-center text-gray-500 hover:bg-gray-100" id="moodNextBtn" aria-label="Selanjutnya">
          &rarr;
        </button>
      </div>
      
      <div class="text-xs text-gray-500 text-right mt-2">
        Tap emoji untuk detail
      </div>
    </div>
  `;
}

function getMoodEmoji(mood) {
  const moodMap = {
    'joy': '😄',
    'neutral': '😐',
    'sadness': '😔',
    'anger': '😠',
  };
  
  return moodMap[mood] || '❓';
}

export function notificationListTemplate(notifications) {
  return `
        <div class="">
            <div>
                ${notifications.map(notificationItemTemplate).join("")}
            </div>
        </div>
    `;
}

export function notificationItemTemplate({
  id = "",
  icon = "images/logo.png",
  title = "",
  message = "",
  read = false,
  createdAt = "",
}) {
  const timeAgo = createdAt ? formatTimeAgo(new Date(createdAt)) : "";

  return `
    <div class="flex items-start gap-3 py-4 border-b border-gray-200 cursor-pointer hover:bg-gray-50 ${
      read ? "opacity-60" : ""
    }" 
         data-notification-id="${id}">
      <div class="w-8 h-8 flex-shrink-0 flex items-center justify-center">
        <img src="${icon}" alt="icon" class="w-7 h-7 object-cover">
      </div>
      <div class="text-left flex-1">
        <div class="flex justify-between items-start">
          <div class="font-semibold text-base text-gray-800 mb-1">${title}</div>
          ${
            !read
              ? '<div class="w-2 h-2 bg-third rounded-full flex-shrink-0"></div>'
              : ""
          }
        </div>
        <div class="text-sm text-gray-700 leading-snug mb-1">${message}</div>
        ${timeAgo ? `<div class="text-xs text-gray-500">${timeAgo}</div>` : ""}
      </div>
    </div>
  `;
}

export function profileTemplate(userData) {
  return `
  <div class="md:ml-16 lg:ml-16 min-h-screen p-6 lg:p-10 pb-20 lg:pb-10">
    <div class="max-w">

    <div class="flex justify-between items-center mb-10">
    <h1 class="text-2xl font-semibold text-gray-900">Profil</h1>

      <div class="relative md:hidden">
      <button class="profileMenuBtn text-gray-500 hover:text-gray-700">
        <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
          <circle cx="12" cy="12" r="1"></circle>
          <circle cx="12" cy="5" r="1"></circle>
          <circle cx="12" cy="19" r="1"></circle>
          </svg>
        </button>

        <div class="story-menu hidden absolute right-0 mt-1 w-32 bg-white rounded-md shadow-lg z-10 border border-gray-200">
          <button id="editProfileMobile" class="w-full text-left px-4 py-2 text-sm text-gray-700 hover:bg-gray-100">Sunting</button>
          <button id="logoutBtnMobile" class="w-full text-left px-4 py-2 text-sm text-red-600 hover:bg-gray-100"">Keluar</button>
          </div>
        </div>
        </div>

            
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
              <div class="text-gray-500">@${
                userData.username || "namapengguna"
              }</div>
            </div>
          </div>
            
        <div class="flex gap-4 mt-6 md:mt-0">
          <button id="editProfileBtn" class="w-25 border border-primary rounded-lg text-primary mt-2 justify-end hidden md:block">Sunting</button>
          <button id="logoutBtnDesktop" class="w-25 bg-red-300 hover:bg-red-500 text-white py-2 rounded-lg mt-2 justify-end hidden md:block" hover:transition>Keluar</button>
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
    <div id="editProfileModal" class="fixed inset-0 flex items-center justify-center bg-black/40 z-50 hidden p-4">
      <div class="bg-white rounded-lg shadow-lg p-4 sm:p-6 w-full max-w-md">
      <div class="flex justify-between items-center mb-4">
        <h3 class="text-lg font-semibold">Edit Profil</h3>
        <button id="closeEditProfileModalBtn" class="text-gray-400 hover:text-gray-600 text-3xl">&times;</button>
      </div>
      <hr class="my-4 border-gray-300">
        
        <form id="editProfileForm" class="space-y-4">
          <div>
            <label class="block text-sm font-medium text-gray-700 mb-1">Nama Lengkap</label>
            <input type="text" name="name" value="${
              userData.name || ""
            }" class="w-full border border-gray-300 rounded-lg p-2 text-sm sm:text-base">
          </div>
          
          <div>
            <label class="block text-sm font-medium text-gray-700 mb-1">Username</label>
            <input type="text" name="username" value="${
              userData.username || ""
            }" 
              class="w-full border border-gray-300 rounded-lg p-2 text-sm sm:text-base">
          </div>
          
          <div>
            <label class="block text-sm font-medium text-gray-700 mb-1">Foto Profil</label>
            <div class="flex items-center gap-4">
            <div class="w-16 h-16 rounded-full overflow-hidden border border-gray-300 flex-shrink-0">
              <img id="profileImagePreview" src="${
                userData.profilePicture || "/images/image.png"
              }"alt="Preview Foto Profil" class="w-full h-full object-cover">
              </div>
              <input type="file" id="profilePictureInput" accept="image/*" class="hidden">
              <button type="button" id="changePhotoBtn" class="text-sm text-primary border border-primary rounded-lg px-3 py-1 whitespace-nowrap">Ganti Foto</button>
            </div>
          </div>
          
          <div class="flex justify-end gap-3 pt-4">
            <button type="button" id="cancelEditBtn" class="flex-1 sm:flex-none border border-gray-300 px-5 py-2 rounded-lg text-gray-700">Batal</button>
            <button type="submit" class="flex-1 sm:flex-none bg-third text-white px-5 py-2 rounded-lg">Simpan</button>
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
  createdAt = "",
  isOwner = false,
  userLiked = false,
  isLiked = false,
}) {
  
  let formattedDate = "";
  if (createdAt) {
    try {
      const date = new Date(createdAt);
      if (!isNaN(date.getTime())) {
        formattedDate = date.toLocaleDateString("id-ID", {
          day: "numeric",
          month: "short",
          year: "numeric",
          hour: "2-digit",
          minute: "2-digit",
        });
      } else {
        formattedDate = "Tanggal tidak valid";
      }
    } catch (e) {
      formattedDate = "Gagal memuat tanggal";
    }
  }

  const liked = userLiked || isLiked;
  
  const likedClass = liked ? 'liked' : '';
  const heartFillClass = liked ? 'fill-red-500 text-red-500' : 'fill-none text-gray-500';
  const likeCountClass = liked ? 'text-red-500 font-semibold' : 'text-gray-600';
  

  const formattedLikeCount = parseInt(likeCount) || 0;
  
  return `
    <div class="story-container flex items-start gap-3 py-3 border-b border-gray-200 max-w-2xl" data-story-id="${storyId}">
      <div class="w-10 h-10 flex-shrink-0 user-info">
        <img src="${profilePicture}" alt="icon" class="w-10 h-10 object-cover rounded-full" />
      </div>

      <div class="flex flex-col text-left story-content w-full">
        <div class="flex justify-between items-start">
          <div class="user-info">
            <div class="font-semibold text-base text-gray-800">${username}</div>
            <div class="text-sm text-gray-500">${handle}</div>
          </div>

          ${
            isOwner
              ? `
          <div class="relative">
            <button class="story-menu-btn p-1 text-gray-500 hover:text-gray-700">
              <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
                <circle cx="12" cy="12" r="1"></circle>
                <circle cx="12" cy="5" r="1"></circle>
                <circle cx="12" cy="19" r="1"></circle>
              </svg>
            </button>

            <div class="story-menu hidden absolute right-0 mt-1 w-32 bg-white rounded-md shadow-lg z-10 border border-gray-200">
              <button class="edit-story-btn w-full text-left px-4 py-2 text-sm text-gray-700 hover:bg-gray-100" data-story-id="${storyId}">Sunting</button>
              <button class="delete-story-btn w-full text-left px-4 py-2 text-sm text-red-600 hover:bg-gray-100" data-story-id="${storyId}">Hapus</button>
            </div>
          </div>
          `
              : ""
          }
        </div>

        <p class="text-gray-700 mt-3 text-sm leading-relaxed">${content}</p>

        ${
          formattedDate
            ? `
          <div class="text-xs text-gray-400 mt-2">
            ${formattedDate}
          </div>
          `
            : ""
        }

        <div class="flex items-center justify-between md:justify-start md:gap-8 mt-3">
          <button class="like-btn flex items-center gap-1 ${likedClass}" data-story-id="${storyId}">
            <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" class="${heartFillClass}"><path d="M20.84 4.61a5.5 5.5 0 0 0-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 0 0-7.78 7.78l1.06 1.06L12 21.23l7.78-7.78 1.06-1.06a5.5 5.5 0 0 0 0-7.78z"></path></svg>
            <span class="like-count text-sm ${likeCountClass}" style="display:inline-block; min-width:16px; padding-left:4px;">${formattedLikeCount}</span>
          </button>
          <button class="comment-btn flex items-center gap-1" data-story-id="${storyId}">
            <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M21 11.5a8.38 8.38 0 0 1-.9 3.8 8.5 8.5 0 0 1-7.6 4.7 8.38 8.38 0 0 1-3.8-.9L3 21l1.9-5.7a8.38 8.38 0 0 1-.9-3.8 8.5 8.5 0 0 1 4.7-7.6 8.38 8.38 0 0 1 3.8-.9h.5a8.48 8.48 0 0 1 8 8v.5z"></path></svg>
            <span class="comment-count text-sm">${commentCount}</span>
          </button>
          <button class="view-btn flex items-center gap-1" data-story-id="${storyId}">
            <svg xmlns="http://www.w3.org/2000/svg" class="w-6 h-6 flex-shrink-0" height="24" viewBox="0 0 24 24" width="24"><path d="M0 0h24v24H0V0z" fill="none"/><path d="M8 17c-.55 0-1-.45-1-1v-5c0-.55.45-1 1-1s1 .45 1 1v5c0 .55-.45 1-1 1zm4 0c-.55 0-1-.45-1-1V8c0-.55.45-1 1-1s1 .45 1 1v8c0 .55-.45 1-1 1zm4 0c-.55 0-1-.45-1-1v-2c0-.55.45-1 1-1s1 .45 1 1v2c0 .55-.45 1-1 1zm2 2H6c-.55 0-1-.45-1-1V6c0-.55.45-1 1-1h12c.55 0 1 .45 1 1v12c0 .55-.45 1-1 1zm1-16H5c-1.1 0-2 .9-2 2v14c0 1.1.9 2 2 2h14c1.1 0 2-.9 2-2V5c0-1.1-.9-2-2-2z"/></svg>
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
  timestamp = "",
  profilePicture = "./images/image.png",
} = {}) {
  const date = new Date(timestamp);
  const formattedDate = date.toLocaleDateString("id-ID", {
    day: "numeric",
    month: "long",
    year: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  });

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
        <button class="absolute right-3 top-1/2 transform -translate-y-1/2 rounded-full bg-[#eee] p-2 w-25 text-white py-2 mt-2 hover:bg-third focus:bg-third justify-end" type="submit">Unggah</button>
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
              placeholder="Unggah komentarmu..."></textarea>
            <button class="absolute right-3 top-1/2 transform -translate-y-1/2 rounded-full bg-[#eee] p-2 w-25 text-white py-2 mt-2 hover:bg-teal-500 focus:bg-teal-500 justify-end" type="submit">Unggah</button>
          </div>
        </div>
      </div>
    </form>
  `;
}


export function commentItemTemplate({
  commentId = "",
  username = "Pengguna",
  handle = "Anonim",
  content = "",
  profilePicture = "./images/image.png",
  createdAt = "",
  likeCount = 0,
  replyCount = 0,
  isOwner = false,
  userLiked = false, 
  isLiked = false, 
} = {}) {
  let formattedDate = "";
  if (createdAt) {
    try {
      const date = new Date(createdAt);
      if (!isNaN(date.getTime())) {
        formattedDate = date.toLocaleDateString("id-ID", {
          day: "numeric",
          month: "short",
          year: "numeric",
          hour: "2-digit",
          minute: "2-digit",
        });
      } else {
        formattedDate = "Tanggal tidak valid";
      }
    } catch (e) {
      formattedDate = "Gagal memuat tanggal";
    }
  }

   const formattedLikeCount = parseInt(likeCount) || 0;
  const liked = userLiked || isLiked;
  
  const likedClass = liked ? 'liked' : '';
  const heartFillClass = liked ? 'fill-red-500 text-red-500' : 'fill-none text-gray-500';
  const likeCountClass = liked ? 'text-red-500 font-semibold' : 'text-gray-600';

  return `
    <div class="comment-item-container flex items-start gap-3 py-3 border-b border-gray-200" data-comment-id="${commentId}">
      <div class="w-8 h-8 flex-shrink-0 user-info">
        <img src="${profilePicture}" alt="icon" class="w-8 h-8 object-cover rounded-full" />
      </div>

      <div class="flex flex-col text-left comment-content w-full">
        <div class="flex justify-between items-start">
        <div class="user-info">
          <div class="font-semibold text-sm text-gray-800 username-comment">${username}</div>
          <div class="text-sm text-gray-500 mb-3 handle-comment">${handle}</div>
        </div>
          ${
            isOwner
              ? `
            <div class="relative comment-actions-menu">
              <button class="comment-menu-btn p-1 text-gray-500 hover:text-gray-700">
                <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
                <circle cx="12" cy="12" r="1"></circle>
                <circle cx="12" cy="5" r="1"></circle>
                <circle cx="12" cy="19" r="1"></circle>
              </svg>
              </button>
              <div class="comment-menu hidden absolute right-0 mt-1 w-32 bg-white rounded-md shadow-lg z-10 border border-gray-200">
                <button class="delete-comment-btn w-full text-left px-4 py-2 text-sm text-red-600 hover:bg-gray-100" data-comment-id="${commentId}">Hapus</button>
              </div>
            </div>
          `
              : ""
          }
        </div>

        <p class="text-gray-700 mt-1 text-sm leading-relaxed">${content}</p>

        ${
          formattedDate
            ? `<div class="text-xs text-gray-400">${formattedDate}</div>`
            : ""
        }

        <div class="flex items-center gap-4 mt-2">
          <button class="comment-like-btn flex items-center gap-1 text-xs ${likedClass}" data-comment-id="${commentId}">
            <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" class="${heartFillClass}"><path d="M20.84 4.61a5.5 5.5 0 0 0-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 0 0-7.78 7.78l1.06 1.06L12 21.23l7.78-7.78 1.06-1.06a5.5 5.5 0 0 0 0-7.78z"></path></svg>
            <span class="comment-like-count ${likeCountClass}">${formattedLikeCount}</span>
          </button>
          <a href="#/comment/${commentId}" class="comment-reply-link flex items-center gap-1 text-xs text-gray-500 hover:text-teal-500">
            <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M21 11.5a8.38 8.38 0 0 1-.9 3.8 8.5 8.5 0 0 1-7.6 4.7 8.38 8.38 0 0 1-3.8-.9L3 21l1.9-5.7a8.38 8.38 0 0 1-.9-3.8 8.5 8.5 0 0 1 4.7-7.6 8.38 8.38 0 0 1 3.8-.9h.5a8.48 8.48 0 0 1 8 8v.5z"></path></svg>
            <span class="comment-reply-count">${replyCount}</span>
          </a>
        </div>
        <div class="replies-container mt-4 pl-4 border-l-2 border-gray-200 space-y-4" hidden>
        </div>
      </div>
    </div>
  `;
}

export function replyFormTemplate({
  parentCommentId = "",
  username = "Nama Pengguna",
  handle = "@namapengguna",
  profilePicture = "./images/image.png",
} = {}) {
  return `
    <form id="reply-form-${parentCommentId}" class="sticky top-4 reply-form-container" data-parent-comment-id="${parentCommentId}">
      <div class="flex items-start gap-3 py-4 border-gray-200 max-w-2xl">
        <div class="w-10 h-10 flex-shrink-0">
          <img src="${profilePicture}" alt="icon" class="w-10 h-10 object-cover rounded-full" />
        </div>
        <div class="flex flex-col text-left w-full">
          <div>
            <div class="font-semibold text-base text-gray-800">${username}</div>
            <div class="text-sm text-gray-500 mb-2">${handle}</div>
          </div>
          <div class="relative w-full z-10">
            <textarea
              id="reply-input-${parentCommentId}"
              class="text-[#8c8c8c] w-full h-24 px-4 py-3 pr-14 rounded-3xl border border-gray-300 focus:outline-none focus:ring-2 focus:ring-teal-500 focus:border-transparent overflow-hidden"
              placeholder="Tulis balasanmu..."></textarea>
            <button class="absolute right-3 top-1/2 transform -translate-y-1/2 rounded-full bg-[#eee] p-2 w-25 text-white py-2 mt-2 hover:bg-teal-500 justify-end" type="submit">Unggah</button>
          </div>
        </div>
      </div>
    </form>
  `;
}

export function editStoryModalTemplate(storyData) {
  const currentContent = storyData.content || "";
  return `
    <div id="editStoryModal" class="fixed inset-0 items-center justify-center bg-black/40 z-50 hidden">
      <div class="bg-white rounded-lg shadow-lg p-6 w-full max-w-md">
        <div class="flex justify-between items-center mb-4">
          <h3 class="text-lg font-semibold">Edit Cerita</h3>
          <button id="closeEditStoryModalBtn" class="text-gray-400 hover:text-gray-600 text-3xl">&times;</button>
        </div>
        <hr class="my-4 border-gray-300">
        <form id="editStoryForm" class="space-y-4">
          <div>
            <label for="storyContentInput" class="block text-sm font-medium text-gray-700 mb-1">Konten Cerita</label>
            <textarea id="storyContentInput" name="content" rows="6"
              class="w-full border border-gray-300 rounded-lg p-2 focus:ring-teal-500 focus:border-teal-500"
              placeholder="Tuliskan ceritamu di sini...">${currentContent}</textarea>
          </div>
          <div class="flex justify-end gap-3 pt-4">
            <button type="button" id="cancelEditStoryBtn"
              class="w-auto border border-gray-300 py-2 px-4 rounded-lg text-gray-700 hover:bg-gray-50">Batal</button>
            <button type="submit"
              class="w-auto bg-teal-500 text-white py-2 px-4 rounded-lg hover:bg-teal-600">Simpan Perubahan</button>
          </div>
        </form>
      </div>
    </div>
  `;
}


export function activityRecommendationsTemplate(recommendations = []) {
  if (!recommendations || recommendations.length === 0) {
    return `
      <div class="mt-6">
        <div class="flex items-center justify-between mb-3">
          <h3 class="text-left font-medium text-gray-800">Rekomendasi Aktivitas Untukmu</h3>
          <button id="regenerate-recommendations" class="text-sm text-third hover:text-third/80 flex items-center">
            <svg xmlns="http://www.w3.org/2000/svg" class="h-4 w-4 mr-1" viewBox="0 0 20 20" fill="currentColor">
              <path fill-rule="evenodd" d="M4 2a1 1 0 011 1v2.101a7.002 7.002 0 0111.601 2.566 1 1 0 11-1.885.666A5.002 5.002 0 005.999 7H9a1 1 0 010 2H4a1 1 0 01-1-1V3a1 1 0 011-1zm.008 9.057a1 1 0 011.276.61A5.002 5.002 0 0014.001 13H11a1 1 0 110-2h5a1 1 0 011 1v5a1 1 0 11-2 0v-2.101a7.002 7.002 0 01-11.601-2.566 1 1 0 01.61-1.276z" clip-rule="evenodd" />
            </svg>
            Rekomendasi Lain
          </button>
        </div>
        <div class="bg-gray-50 border border-gray-200 rounded-lg p-4 text-center text-gray-500">
          Belum ada rekomendasi aktivitas untuk ditampilkan.
        </div>
      </div>
    `;
  }
  
  const getEnergyContext = (level) => {
    const energyContexts = {
      "Rendah": "Cocok untuk energi terbatas",
      "Sedang": "Membutuhkan energi sedang",
      "Tinggi": "Membutuhkan energi penuh",
      "Rendah-Sedang": "Cocok untuk energi rendah ke sedang",
      "Sedang-Lama": "Membutuhkan energi sedang untuk waktu yang lebih lama",
      "Lama": "Membutuhkan waktu lama untuk menyelesaikan"
    };
    
    return energyContexts[level] || level;
  };
  
  return `
    <div class="mt-6">
      <div class="flex items-center justify-between mb-3">
        <h3 class="text-left font-medium text-gray-800">Rekomendasi Aktivitas Untukmu</h3>
        <button id="regenerate-recommendations" class="text-sm text-third hover:text-third/80 flex items-center">
          <svg xmlns="http://www.w3.org/2000/svg" class="h-4 w-4 mr-1" viewBox="0 0 20 20" fill="currentColor">
            <path fill-rule="evenodd" d="M4 2a1 1 0 011 1v2.101a7.002 7.002 0 0111.601 2.566 1 1 0 11-1.885.666A5.002 5.002 0 005.999 7H9a1 1 0 010 2H4a1 1 0 01-1-1V3a1 1 0 011-1zm.008 9.057a1 1 0 011.276.61A5.002 5.002 0 0014.001 13H11a1 1 0 110-2h5a1 1 0 011 1v5a1 1 0 11-2 0v-2.101a7.002 7.002 0 01-11.601-2.566 1 1 0 01.61-1.276z" clip-rule="evenodd" />
          </svg>
          Rekomendasi Lain
        </button>
      </div>
      <div class="space-y-3">
        ${recommendations.map(rec => `
          <div class="bg-gray-50 border border-gray-200 rounded-lg p-3 hover:shadow-md transition-shadow">
            <div class="flex items-center mb-2">
              <span class="bg-third/10 text-third text-xs px-2 py-1 rounded-md">${rec.category}</span>
              <span class="ml-2 text-xs text-gray-500">${rec.duration}</span>
            </div>
            <h4 class="font-medium text-sm text-left">${rec.name}</h4>
            <div class="flex items-center mt-2">
              <span class="bg-gray-100 text-xs px-2 py-1 rounded-md flex items-center">
                <span class="text-gray-600">${getEnergyContext(rec.energy_needed)}</span>
              </span>
            </div>
          </div>
        `).join('')}
      </div>
    </div>
  `;
}


export function showToast(message, type = 'success') {
    const existingToast = document.getElementById('toast-notification');
    if (existingToast) {
        existingToast.remove();
    }
    
    const bgColor = type === 'success' ? 'bg-green-500' : 'bg-red-500';
    
    const toastHTML = `
        <div id="toast-notification" class="fixed bottom-4 right-4 ${bgColor} text-white py-2 px-4 rounded-md shadow-lg flex items-center z-50 transform transition-all duration-300 opacity-0 translate-y-2">
            ${type === 'success' ? 
                `<svg class="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M5 13l4 4L19 7"></path>
                </svg>` :
                `<svg class="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"></path>
                </svg>`
            }
            <span>${message}</span>
        </div>
    `;
    document.body.insertAdjacentHTML('beforeend', toastHTML);
    
    const toast = document.getElementById('toast-notification');
    
    setTimeout(() => {
        toast.classList.remove('opacity-0', 'translate-y-2');
        toast.classList.add('opacity-100', 'translate-y-0');
    }, 10);
    
    setTimeout(() => {
        toast.classList.add('opacity-0', 'translate-y-2');
        setTimeout(() => {
            toast.remove();
        }, 300); 
    }, 3000); 
}


export function botTypingBubble(message = 'Sedang mengetik...', requestId = null) {
    const id = requestId ? `typing-${requestId}` : 'typing-indicator';
    
    return `
    <div id="${id}" class="flex justify-start mb-4">
        <div class="bg-gray-100 rounded-2xl p-3 px-4 max-w-[75%] text-left">
            <div class="flex items-center">
                <div class="w-2 h-2 bg-gray-400 rounded-full animate-pulse mr-1"></div>
                <div class="w-2 h-2 bg-gray-400 rounded-full animate-pulse delay-75 mr-1"></div>
                <div class="w-2 h-2 bg-gray-400 rounded-full animate-pulse delay-150"></div>
            </div>
            <div class="text-xs text-gray-500 mt-1">${message}</div>
        </div>
    </div>
    `;
}