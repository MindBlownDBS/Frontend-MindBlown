import { BASE_URL } from "../config";
import { getAccessToken } from "../utils/auth";

const ENDPOINTS = {
  LOGIN: "/login",
  REGISTER: "/register",
  MIND_TRACKER: "/mind-tracker",
  MIND_TRACKER_CHECK: "/mind-tracker/check",
  MIND_TRACKER_WEEKLY: "/mind-tracker/weekly",
  NOTIFICATIONS: "/notifications",
  MARK_NOTIFICATION_READ: "/notifications",
  MARK_ALL_NOTIFICATIONS_READ: "/notifications/read-all",
  SUBSCRIBE_PUSH: "/notifications/push/subscribe",
  UNSUBSCRIBE_PUSH: "/notifications/push/unsubscribe",
  RECOMMENDATIONS: "/recommendations",
  CHATBOT_HISTORY: "/chatbot/history",
};

export async function getRegister(username, name, preferences, email, password) {
  const data = JSON.stringify({ username, name, preferences, email, password });
  const response = await fetch(`${BASE_URL}${ENDPOINTS.REGISTER}`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: data,
  });

  const responseJson = await response.json();

  return responseJson;
}

export async function getLogin(usernameOrEmail, password) {
  const data = JSON.stringify({ usernameOrEmail, password });
  const response = await fetch(`${BASE_URL}${ENDPOINTS.LOGIN}`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: data,
  });

  const responseJson = await response.json();

  return responseJson;
}

export async function checkTodayEntry() {
  const accessToken = localStorage.getItem("accessToken");
  if (!accessToken) {
    throw new Error("Anda belum login. Silakan login terlebih dahulu.");
  }

  const today = new Date();
  const todayStr = today.toISOString().split("T")[0];

  const response = await fetch(
    `${BASE_URL}${ENDPOINTS.MIND_TRACKER_CHECK}/${todayStr}`,
    {
      headers: {
        Authorization: `Bearer ${accessToken}`,
      },
    }
  );

  const result = await response.json();

  if (response.error) {
    throw new Error(result.message || "Terjadi kesalahan saat mengecek data");
  }

  return result;
}

export async function getEntryByDate(dateStr) {
  const accessToken = localStorage.getItem("accessToken");
  if (!accessToken) {
    throw new Error("Anda belum login. Silakan login terlebih dahulu.");
  }

  const dateObj = new Date(dateStr);
  const apiDateStr = dateObj.toISOString().split("T")[0];

  const response = await fetch(
    `${BASE_URL}${ENDPOINTS.MIND_TRACKER}/${apiDateStr}`,
    {
      headers: {
        Authorization: `Bearer ${accessToken}`,
      },
    }
  );

  return await response.json();
}

export async function saveEntry(data) {
  const accessToken = localStorage.getItem("accessToken");
  if (!accessToken) {
    throw new Error("Anda belum login. Silakan login terlebih dahulu.");
  }

  const response = await fetch(`${BASE_URL}${ENDPOINTS.MIND_TRACKER}`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${accessToken}`,
    },
    body: JSON.stringify(data),
  });

  const result = await response.json();

  if (response.error) {
    throw new Error(result.message || "Terjadi kesalahan saat menyimpan data");
  }

  return result;
}

// export async function getWeeklyTrackerEntries() {
//   try {
//     const accessToken = getAccessToken();
//     if (!accessToken) {
//       throw new Error("Anda belum login. Silakan login terlebih dahulu.");
//     }

//     const response = await fetch(`${BASE_URL}${ENDPOINTS.MIND_TRACKER_WEEKLY}`, {
//       headers: {
//         Authorization: `Bearer ${accessToken}`,
//       },
//     });

//     const result = await response.json();

//     if (!response.ok) {
//       throw new Error(
//         result.message || "Terjadi kesalahan saat mengambil data tracker mingguan"
//       );
//     }

//     return result;
//   } catch (error) {
//     console.error("Error fetching weekly tracker entries:", error);
//     return {
//       error: true,
//       message: error.message || "Gagal mengambil data tracker mingguan",
//       data: { weeklyDetails: [] }
//     };
//   }
// }

export async function getWeeklyTrackerEntries(weekOffset = 0) {
  try {
    const accessToken = getAccessToken();
    if (!accessToken) {
      throw new Error("Anda belum login. Silakan login terlebih dahulu.");
    }

    let url = `${BASE_URL}${ENDPOINTS.MIND_TRACKER_WEEKLY}`;
    if (weekOffset !== 0) {
      url += `?offset=${weekOffset}`;
    }

    const response = await fetch(url, {
      headers: {
        Authorization: `Bearer ${accessToken}`,
      },
    });

    const result = await response.json();

    if (!response.ok) {
      throw new Error(
        result.message || "Terjadi kesalahan saat mengambil data tracker mingguan"
      );
    }

    return result;
  } catch (error) {
    console.error("Error fetching weekly tracker entries:", error);
    return {
      error: true,
      message: error.message || "Gagal mengambil data tracker mingguan",
      data: { weeklyDetails: [] }
    };
  }
}

export async function getStories() {
  const accessToken = getAccessToken();
  try {
    const response = await fetch(`${BASE_URL}/stories`, {
      headers: {
        Authorization: `Bearer ${accessToken}`,
      },
    });
    return await response.json();
  } catch (error) {
    console.error("Error fetching stories:", error);
    return { error: true, message: "Gagal menampilkan cerita" };
  }
}

export async function postStory(content, isAnonymous = false) {
  try {
    const token = getAccessToken();
    if (!token) throw new Error("No authentication token found");

    const response = await fetch(`${BASE_URL}/stories`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${token}`,
      },
      body: JSON.stringify({
        content,
        isAnonymous,
      }),
    });

    const data = await response.json();

    if (!response.ok) {
      throw new Error(data.message || "Gagal mengunggah cerita");
    }

    return data;
  } catch (error) {
    console.error("Error posting story:", error);
    throw error;
  }
}

export async function getUserProfile(username) {
  const accessToken = getAccessToken();
  if (!accessToken) {
    throw new Error("Anda belum login. Silakan login terlebih dahulu.");
  }

  const response = await fetch(`${BASE_URL}/profile/${username}`, {
    headers: {
      Authorization: `Bearer ${accessToken}`,
    },
  });

  const result = await response.json();

  if (response.error) {
    throw new Error(
      result.message || "Terjadi kesalahan saat mengambil profil"
    );
  }

  return result;
}

export const getStoryDetail = async (storyId) => {
  try {
    if (!storyId || storyId === "undefined") {
      return {
        error: true,
        message: "Invalid story ID. Story ID is required.",
      };
    }

    const response = await fetch(`${BASE_URL}/stories/${storyId}`, {
      headers: {
        Authorization: `Bearer ${getAccessToken()}`,
      },
    });

    const contentType = response.headers.get("content-type");
    if (!contentType || !contentType.includes("application/json")) {
      const text = await response.text();
      throw new Error(`Expected JSON but got: ${text.substring(0, 100)}...`);
    }

    const data = await response.json();

    if (!response.ok) {
      return { error: true, message: data.message || "Failed to fetch story" };
    }

    return data;
  } catch (error) {
    console.error("Error fetching story detail:", error);
    return {
      error: true,
      message: error.message || "Network error while fetching story",
    };
  }
};

export async function likeStory(storyId) {
  try {
    if (!storyId) {
      throw new Error("Invalid story ID");
    }

    const token = getAccessToken();
    if (!token) throw new Error("Authentication required");

    const response = await fetch(`${BASE_URL}/stories/${storyId}/likes`, {
      method: "POST",
      headers: {
        Authorization: `Bearer ${token}`,
        "Content-Type": "application/json",
      },
    });

    const data = await response.json();

    if (!response.ok) {
      throw new Error(data.message || "Failed to like story");
    }

    return data;
  } catch (error) {
    console.error("Failed to like story:", error);
    throw error;
  }
}

export async function commentOnStory(storyId, content) {
  const response = await fetch(`${BASE_URL}/stories/${storyId}/comments`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${getAccessToken()}`,
    },
    body: JSON.stringify({ content }),
  });
  return await response.json();
}

export async function updateProfile(updatedData) {
  try {
    const token = localStorage.getItem("accessToken");

    if (!token || typeof token !== "string" || !token.includes(".")) {
      throw new Error("Invalid token structure");
    }

    const response = await fetch(`${BASE_URL}/profile`, {
      method: "PUT",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${token}`,
      },
      body: JSON.stringify(updatedData),
    });

    const data = await response.json();

    if (!response.ok) {
      return {
        error: true,
        message: data.message || "Failed to update profile",
      };
    }

    return data;
  } catch (error) {
    return {
      error: true,
      message: error.message || "Network error occurred",
    };
  }
}

export async function getNotifications() {
  try {
    const accessToken = getAccessToken();
    if (!accessToken) {
      throw new Error("Anda belum login. Silakan login terlebih dahulu.");
    }

    const response = await fetch(`${BASE_URL}${ENDPOINTS.NOTIFICATIONS}`, {
      headers: {
        Authorization: `Bearer ${accessToken}`,
      },
    });

    const result = await response.json();

    if (!response.ok) {
      throw new Error(
        result.message || "Terjadi kesalahan saat mengambil notifikasi"
      );
    }

    return result;
  } catch (error) {
    console.error("Error fetching notifications:", error);
    return {
      error: true,
      message: error.message || "Gagal mengambil notifikasi",
    };
  }
}

export async function markNotificationAsRead(notificationId) {
  try {
    const accessToken = getAccessToken();
    if (!accessToken) {
      throw new Error("Anda belum login. Silakan login terlebih dahulu.");
    }

    const url = `${BASE_URL}${ENDPOINTS.MARK_NOTIFICATION_READ}/${notificationId}/read`;

    const response = await fetch(url, {
      method: "PUT",
      headers: {
        Authorization: `Bearer ${accessToken}`,
        "Content-Type": "application/json",
      },
    });

    const contentType = response.headers.get("content-type");

    let result;
    if (contentType && contentType.includes("application/json")) {
      result = await response.json();
    } else {
      const text = await response.text();
      throw new Error(`Server returned non-JSON response: ${text}`);
    }

    if (!response.ok) {
      if (response.status === 403) {
        throw new Error(
          "Anda tidak memiliki akses untuk menandai notifikasi ini"
        );
      } else if (response.status === 404) {
        throw new Error("Notifikasi tidak ditemukan");
      } else {
        throw new Error(
          result.message || "Terjadi kesalahan saat menandai notifikasi"
        );
      }
    }
    return result;
  } catch (error) {
    console.error("Error message:", error.message);

    return {
      error: true,
      message: error.message || "Gagal menandai notifikasi sebagai dibaca",
    };
  }
}

export async function markAllNotificationsAsRead() {
  try {
    const accessToken = getAccessToken();
    if (!accessToken) {
      throw new Error("Anda belum login. Silakan login terlebih dahulu.");
    }

    const response = await fetch(
      `${BASE_URL}${ENDPOINTS.MARK_ALL_NOTIFICATIONS_READ}`,
      {
        method: "PUT",
        headers: {
          Authorization: `Bearer ${accessToken}`,
          "Content-Type": "application/json",
        },
      }
    );


    const contentType = response.headers.get("content-type");

    let result;
    if (contentType && contentType.includes("application/json")) {
      result = await response.json();
    } else {
      const text = await response.text();
      throw new Error(`Server returned non-JSON response: ${text}`);
    }

    if (!response.ok) {
      throw new Error(
        result.message || "Terjadi kesalahan saat menandai semua notifikasi"
      );
    }

    return result;
  } catch (error) {
    console.error("Error marking all notifications as read:", error);
    console.error("Error type:", error.constructor.name);
    console.error("Error message:", error.message);

    if (
      error instanceof TypeError &&
      error.message.includes("Failed to fetch")
    ) {
      return {
        error: true,
        message:
          "Tidak dapat terhubung ke server. Periksa koneksi internet Anda dan pastikan server berjalan.",
      };
    }

    return {
      error: true,
      message:
        error.message || "Gagal menandai semua notifikasi sebagai dibaca",
    };
  }
}

export async function subscribePushNotification(subscription) {
  try {
    const accessToken = getAccessToken();
    if (!accessToken) {
      throw new Error("Anda belum login. Silakan login terlebih dahulu.");
    }

    const response = await fetch(`${BASE_URL}${ENDPOINTS.SUBSCRIBE_PUSH}`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${accessToken}`,
      },
      body: JSON.stringify({ subscription }),
    });

    const result = await response.json();

    if (!response.ok) {
      throw new Error(
        result.message || "Gagal menyimpan subscription push notification"
      );
    }

    return result;
  } catch (error) {
    console.error("Error subscribing push notification:", error);
    return {
      error: true,
      message: error.message || "Gagal berlangganan push notification",
    };
  }
}

export async function unsubscribePushNotification() {
  try {
    const accessToken = getAccessToken();
    if (!accessToken) {
      throw new Error("Anda belum login. Silakan login terlebih dahulu.");
    }

    const response = await fetch(`${BASE_URL}${ENDPOINTS.UNSUBSCRIBE_PUSH}`, {
      method: "DELETE",
      headers: {
        Authorization: `Bearer ${accessToken}`,
        "Content-Type": "application/json",
      },
    });

    const result = await response.json();

    if (!response.ok) {
      throw new Error(
        result.message || "Gagal menghapus subscription push notification"
      );
    }

    return result;
  } catch (error) {
    console.error("Error unsubscribing push notification:", error);
    return {
      error: true,
      message: error.message || "Gagal berhenti berlangganan push notification",
    };
  }
}

export const editStory = async (storyId, content) => {
  try {
    const token = getAccessToken();
    if (!token) throw new Error("Authentication token not found");
    if (!storyId) throw new Error("Story ID is required for editing");

    const response = await fetch(`${BASE_URL}/stories/${storyId}`, {
      method: "PUT",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${token}`,
      },
      body: JSON.stringify({ content }),
    });

    const data = await response.json();
    if (!response.ok) {
      console.error(
        `Error editing story ${storyId} - Status: ${response.status}`,
        data
      );
      throw new Error(
        data.message || `Failed to edit story. Status: ${response.status}`
      );
    }
    return data;
  } catch (error) {
    console.error(
      `Error editing story (catch block) for ID ${storyId}:`,
      error
    );
    throw error;
  }
};

export const deleteStory = async (storyId) => {
  try {
    const token = getAccessToken();
    if (!token) throw new Error("Authentication token not found");
    if (!storyId) throw new Error("Story ID is required for deleting");

    const response = await fetch(`${BASE_URL}/stories/${storyId}`, {
      method: "DELETE",
      headers: {
        Authorization: `Bearer ${token}`,
      },
    });

    if (!response.ok) {
      let errorData = {
        message: `Failed to delete story. Status: ${response.status}`,
      };
      try {
        errorData = await response.json();
      } catch (e) {
        console.warn("Could not parse error response as JSON for deleteStory");
      }
      console.error(
        `Error deleting story ${storyId} - Status: ${response.status}`,
        errorData
      );
      throw new Error(
        errorData.message ||
        `Failed to delete story. Status: ${response.status}`
      );
    }

    if (response.status === 204) {
      return { success: true, message: "Story deleted successfully." };
    }
    return await response.json();
  } catch (error) {
    console.error(
      `Error deleting story (catch block) for ID ${storyId}:`,
      error
    );
    throw error;
  }
};

export async function replyToComment(parentCommentId, content) {
  const response = await fetch(
    `${BASE_URL}/comments/${parentCommentId}/replies`,
    {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${getAccessToken()}`,
      },
      body: JSON.stringify({ content }),
    }
  );
  return await response.json();
}

export async function likeComment(commentId) {
  const response = await fetch(`${BASE_URL}/comments/${commentId}/likes`, {
    method: "POST",
    headers: {
      Authorization: `Bearer ${getAccessToken()}`,
    },
  });
  return await response.json();
}

export async function deleteCommentApi(commentId) {
  const response = await fetch(`${BASE_URL}/comments/${commentId}`, {
    method: "DELETE",
    headers: {
      Authorization: `Bearer ${getAccessToken()}`,
    },
  });
  return await response.json();
}

export async function getCommentDetail(commentId) {
  const response = await fetch(`${BASE_URL}/comments/${commentId}`, {
    method: "GET",
    headers: {
      Authorization: `Bearer ${getAccessToken()}`,
    },
  });
  if (!response.ok) {
    throw new Error(`Failed to fetch comment detail: ${response.statusText}`);
  }
  return await response.json();
}

export async function getUserRecommendations(username) {
  try {
    if (!username) {
      throw new Error("Username is required");
    }

    const accessToken = getAccessToken();
    if (!accessToken) {
      throw new Error("Anda belum login. Silakan login terlebih dahulu.");
    }

    const response = await fetch(`${BASE_URL}${ENDPOINTS.RECOMMENDATIONS}/${username}`, {
      method: "GET",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${accessToken}`,
      }
    });

    const result = await response.json();

    if (!response.ok) {
      throw new Error(result.message || `Error ${response.status}: Terjadi kesalahan saat mengambil rekomendasi`);
    }

    return result;
  } catch (error) {
    console.error("Error fetching recommendations:", error);
    return {
      error: true,
      message: error.message || "Gagal mengambil rekomendasi aktivitas",
      data: { recommendations: [] }
    };
  }
}

export async function regenerateRecommendations(username) {
  try {
    if (!username) {
      throw new Error("Username is required");
    }

    const accessToken = getAccessToken();
    if (!accessToken) {
      throw new Error("Anda belum login. Silakan login terlebih dahulu.");
    }

    const response = await fetch(`${BASE_URL}${ENDPOINTS.RECOMMENDATIONS}/${username}/regenerate`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${accessToken}`,
      }
    });

    const result = await response.json();

    if (!response.ok) {
      throw new Error(result.message || `Error ${response.status}: Terjadi kesalahan saat meregenerasi rekomendasi`);
    }

    return result;
  } catch (error) {
    console.error("Error regenerating recommendations:", error);
    return {
      error: true,
      message: error.message || "Gagal meregenerasi rekomendasi aktivitas"
    };
  }
}

export async function getChatHistory() {
  try {
    const accessToken = getAccessToken();


    if (!accessToken) {
      return {
        error: false,
        message: "User not logged in",
        data: { chats: [], total: 0 }
      };
    }

    const response = await fetch(`${BASE_URL}${ENDPOINTS.CHATBOT_HISTORY}`, {
      headers: {
        Authorization: `Bearer ${accessToken}`,
      }
    });

    const result = await response.json();

    if (!response.ok) {
      console.warn(`API error ${response.status}:`, result.message);
      return {
        error: true,
        message: result.message || `Error ${response.status}: Terjadi kesalahan saat mengambil riwayat chat`,
        data: { chats: [], total: 0 }
      };
    }

    return result;
  } catch (error) {
    console.warn("Error fetching chat history:", error);
    return {
      error: true,
      message: error.message || "Gagal mengambil riwayat chat",
      data: { chats: [], total: 0 }
    };
  }
}